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

export function resetAppAuth() {
  // @ts-ignore
  passport.user = getNewReferentFixture();
  // @ts-ignore
  passport.user._id = new ObjectId();
  // @ts-ignore
  passport.authStrategy = undefined;
  // passport.lastTypeCalledOnAuthenticate = undefined;
}

function getAppHelper(user?: Partial<UserRequest["user"] & { subRole?: any }> | YoungDocument | ReferentDocument | null, authStrategy?: "young" | "referent") {
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
    // instance of model
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
