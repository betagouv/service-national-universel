import { getAcl } from "./services/iam/Permission.service";
import { Request } from "express";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import { Model } from "mongoose";
import Joi from "joi";

import { ROLES, ROLE_JEUNE } from "snu-lib";

import { YoungModel, ReferentModel } from "./models";
import { checkJwtSigninVersion } from "./jwt-options";
import { config } from "./config";
import { capture } from "./sentry";
import { isYoung } from "./utils";

interface JwtPayload {
  __v: string;
  _id: string;
  passwordChangedAt: Date | null;
  lastLogoutAt: Date | null;
}

function getToken(req: Request): string | null {
  let token = ExtractJwt.fromAuthHeaderWithScheme("JWT")(req);

  // * On first call after refresh, the token is only in the cookie
  if (!token) {
    const origin = req.get("Origin");
    if (origin === config.APP_URL) token = req.cookies.jwt_young;
    else if (origin === config.ADMIN_URL) token = req.cookies.jwt_ref;
    else if (origin === config.KNOWLEDGEBASE_URL) {
      token = req.cookies.jwt_ref;
      if (!token) token = req.cookies.jwt_young;
    }
  }
  return token;
}

async function validateUser(userModel: Model<any>, jwtPayload: JwtPayload, done: VerifiedCallback, role?: string) {
  try {
    const { error, value } = Joi.object({
      __v: Joi.string().required(),
      _id: Joi.string().required(),
      _impersonateId: Joi.string().allow(null),
      passwordChangedAt: Joi.date().allow(null),
      lastLogoutAt: Joi.date().allow(null),
    }).validate(jwtPayload, { stripUnknown: true });

    if (error) return done(null, false);
    if (!checkJwtSigninVersion(value)) return done(null, false);

    const user = await userModel.findById(value._id);
    if (user) {
      const passwordMatch = user.passwordChangedAt?.getTime() === value.passwordChangedAt?.getTime();
      const logoutMatch = user.lastLogoutAt?.getTime() === value.lastLogoutAt?.getTime();

      if (passwordMatch && logoutMatch && (!role || user.role === role)) {
        if (value._impersonateId) {
          user.impersonateId = value._impersonateId;
          const impersonateUser = await userModel.findById(value._impersonateId);
          if (impersonateUser) {
            user.impersonatedBy = impersonateUser;
          }
        }
        if (user.role || user.roles?.length) {
          user.acl = await getAcl(user);
        } else if (isYoung(user)) {
          user.acl = await getAcl({ roles: [ROLE_JEUNE] });
        }
        return done(null, user);
      }
    }
  } catch (error) {
    capture(error);
  }
  return done(null, false);
}

function initPassport(): void {
  const opts = {
    jwtFromRequest: getToken,
    secretOrKey: config.JWT_SECRET,
  };

  passport.use("young", new JwtStrategy(opts, (jwtPayload, done) => validateUser(YoungModel, jwtPayload, done)));
  passport.use("referent", new JwtStrategy(opts, (jwtPayload, done) => validateUser(ReferentModel, jwtPayload, done)));
  passport.use("admin", new JwtStrategy(opts, (jwtPayload, done) => validateUser(ReferentModel, jwtPayload, done, ROLES.ADMIN)));
  passport.use("dsnj", new JwtStrategy(opts, (jwtPayload, done) => validateUser(ReferentModel, jwtPayload, done, ROLES.DSNJ)));
  passport.use("injep", new JwtStrategy(opts, (jwtPayload, done) => validateUser(ReferentModel, jwtPayload, done, ROLES.INJEP)));
}

export { initPassport, getToken };
