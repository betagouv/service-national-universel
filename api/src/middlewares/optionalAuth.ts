import jwt from "jsonwebtoken";
import Joi from "joi";
import { Response, NextFunction } from "express";

import { config } from "../config";
import { ReferentModel, YoungModel } from "../models";
import { getToken } from "../passport";
import { checkJwtSigninVersion } from "../jwt-options";
import { getAcl } from "../services/iam/Permission.service";
import { UserRequest } from "../controllers/request";

interface JwtPayload {
  __v: string;
  _id: string;
  passwordChangedAt: Date | null;
  lastLogoutAt: Date | null;
}

const optionalAuth = async (req: UserRequest, _: Response, next: NextFunction) => {
  try {
    const token = getToken(req);
    if (token) {
      const jwtPayload = (await jwt.verify(token, config.JWT_SECRET)) as JwtPayload;

      // Validate the JWT payload
      const { error, value } = Joi.object({
        __v: Joi.string().required(),
        _id: Joi.string().required(),
        passwordChangedAt: Joi.date().allow(null),
        lastLogoutAt: Joi.date().allow(null),
      }).validate(jwtPayload, { stripUnknown: true });

      if (error || !checkJwtSigninVersion(value)) return;

      const { _id, passwordChangedAt, lastLogoutAt } = value;
      let user = await ReferentModel.findById(_id);
      if (user) {
        // @ts-expect-error mapping user to UserDto
        user.acl = await getAcl(user);
      }

      if (!user) {
        user = await YoungModel.findById(_id);
      }

      if (user) {
        const passwordMatch = passwordChangedAt?.getTime() === user.passwordChangedAt?.getTime();
        const logoutMatch = lastLogoutAt?.getTime() === user.lastLogoutAt?.getTime();

        if (passwordMatch && logoutMatch) {
          // @ts-expect-error mapping user to UserDto
          req.user = user;
        }
      }
    }
  } catch (e) {
    // Silently handle errors (no action needed)
  }
  next();
};

export default optionalAuth;
