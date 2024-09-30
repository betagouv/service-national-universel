/* eslint-disable no-import-assign */
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import passport from "passport";

import { injectRoutes } from "../../routes";
import { UserRequest } from "../../controllers/request";

function getAppHelper(user?: Partial<UserRequest["user"] & { subRole?: any }> | null, authStrategy?: "young" | "referent") {
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
    // @ts-ignore
    passport.user = { ...passport.user, ...user };
  }
  if (authStrategy) {
    // @ts-ignore
    passport.authStrategy = authStrategy;
  }
  return app;
}

export default getAppHelper;
