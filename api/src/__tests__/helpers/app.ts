/* eslint-disable no-import-assign */
import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { injectRoutes } from "../../routes";
import { UserRequest } from "../../controllers/request";
import getNewReferentFixture from "../fixtures/referent";
import { isReferent, isYoung } from "../../utils";
import { ReferentDocument, YoungDocument } from "../../models";
import { getAcl } from "../../services/iam/Permission.service";
import { ROLE_JEUNE, ROLES } from "snu-lib";
import { resetRateLimiters } from "../../middlewares/rateLimit";
import { applyBodyParsers, handleError } from "../../middlewares/httpHardening";

export function resetAppAuth() {
  // Les limiteurs de débit des routes d'auth vivent au niveau du module, donc
  // sont partagés par tous les getAppHelper() d'un même process : sans remise à
  // zéro, un cas de test épuiserait le quota des suivants.
  resetRateLimiters();
  // @ts-ignore
  passport.user = getNewReferentFixture();
  // @ts-ignore
  passport.user._id = new ObjectId();
  // @ts-ignore
  passport.authStrategy = undefined;
  // passport.lastTypeCalledOnAuthenticate = undefined;
}

export async function getAppHelperWithAcl(user?: Partial<UserRequest["user"] & { subRole?: any }> | YoungDocument | ReferentDocument | null, authStrategy?: "young" | "referent") {
  if (user) {
    if (isYoung(user)) {
      // @ts-ignore
      user.acl = await getAcl({ ...user, roles: [ROLE_JEUNE] } as any);
    } else if (isReferent(user)) {
      // @ts-ignore
      user.acl = await getAcl(user as any);
    } else {
      // @ts-ignore
      user.acl = await getAcl(user as any);
    }
    return getAppHelper(user, authStrategy);
  } else {
    return getAppHelper({ role: ROLES.ADMIN, acl: await getAcl({ role: ROLES.ADMIN }) } as any, authStrategy);
  }
}

function getAppHelper(user?: Partial<UserRequest["user"] & { subRole?: any; acl?: any[] }> | YoungDocument | ReferentDocument | null, authStrategy?: "young" | "referent") {
  const app = express();
  // Mêmes analyseurs de corps et même gestionnaire d'erreurs que main.js.
  applyBodyParsers(app);
  // @ts-ignore
  app.use(cookieParser());
  injectRoutes(app);
  app.use(handleError);

  if (user) {
    // @ts-ignore
    if (!passport.user) {
      // @ts-ignore
      passport.user = { _id: "123" };
    }
    // @ts-ignore instance of model
    if (isYoung(user) || isReferent(user)) {
      // @ts-ignore
      passport.user = user;
    } else {
      // @ts-ignore
      passport.user = { ...passport.user, ...user };
    }
  }
  if (authStrategy) {
    // @ts-ignore
    passport.authStrategy = authStrategy;
  }
  return app;
}

export default getAppHelper;
