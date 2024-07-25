const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");

const { injectRoutes } = require("../../routes");

function getAppHelper(role, userId) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.text({ type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  injectRoutes(app);

  if (role) {
    if (!passport.user) {
      passport.user = { _id: "123" };
    }
    passport.user.role = role;
    if (userId) {
      passport.user._id = userId;
    }
  }
  return app;
}

module.exports = getAppHelper;
