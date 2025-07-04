/* eslint-disable no-import-assign */
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
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

export function resetAppAuth() {
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
    // @ts-ignore
    console.log("userWithAcl", user?._id, JSON.stringify(user?.acl, null, 2));
    return getAppHelper(user, authStrategy);
  } else {
    return getAppHelper({ role: ROLES.ADMIN, acl: await getAcl({ role: ROLES.ADMIN }) } as any, authStrategy);
  }
}

function getAppHelper(user?: Partial<UserRequest["user"] & { subRole?: any; acl?: any[] }> | YoungDocument | ReferentDocument | null, authStrategy?: "young" | "referent") {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.text({ type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  // @ts-ignore
  app.use(cookieParser());
  injectRoutes(app);

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
