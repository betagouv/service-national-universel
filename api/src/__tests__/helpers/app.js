const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");

const { injectRoutes } = require("../../routes");

function getAppHelper(user) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.text({ type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  injectRoutes(app);

  if (user) {
    if (!passport.user) {
      passport.user = { _id: "123" };
    }
    passport.user = { ...passport.user, ...user };
  }
  return app;
}

module.exports = getAppHelper;
