const { config } = require("./config");
const { JWT_SIGNIN_MAX_AGE_SEC, JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC, JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC } = require("./jwt-options");

//!COOKIE need to be in milliseconds
const COOKIE_SIGNIN_MAX_AGE_MS = JWT_SIGNIN_MAX_AGE_SEC * 1000;
const COOKIE_SNUPPORT_MAX_AGE_MS = 60 * 60 * 2 * 1000; //2h
const COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS = JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC * 1000;
const COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS = JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC * 1000;
//!COOKIE need to be in milliseconds

function cookieOptions(maxAge) {
  switch (config.ENVIRONMENT) {
    case "test":
    case "development":
      return { maxAge, httpOnly: true, secure: false, domain: "localhost", sameSite: "Lax" };
    case "staging":
    case "ci":
      return { maxAge, httpOnly: true, secure: true, domain: ".beta-snu.dev", sameSite: "Lax" };
    case "production":
      return { maxAge, httpOnly: true, secure: true, domain: ".snu.gouv.fr", sameSite: "Lax" };
    default: //env custom
      return { maxAge, httpOnly: true, secure: true, sameSite: "None" };
  }
}

module.exports = {
  cookieOptions,
  COOKIE_SIGNIN_MAX_AGE_MS,
  COOKIE_SNUPPORT_MAX_AGE_MS,
  COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS,
  COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS,
};
