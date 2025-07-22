const { config } = require("./config");

const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24; // 1 day (in ms)

function cookieOptions() {
  switch (config.ENVIRONMENT) {
    case "test":
    case "development":
      return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: false, domain: "localhost", sameSite: "Lax" };
    case "production":
      return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: true, domain: ".snu.gouv.fr", sameSite: "Lax" };
    default: //env custom
      return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: true, domain: ".beta-snu.dev", sameSite: "Lax" };
  }
}

function logoutCookieOptions() {
  switch (config.ENVIRONMENT) {
    case "test":
    case "development":
      return { httpOnly: true, secure: false, domain: "localhost", sameSite: "Lax" };
    case "production":
      return { httpOnly: true, secure: true, domain: ".snu.gouv.fr", sameSite: "Lax" };
    default: //env custom
      return { httpOnly: true, secure: true, domain: ".beta-snu.dev", sameSite: "Lax" };
  }
}

module.exports = {
  cookieOptions,
  logoutCookieOptions,
};
