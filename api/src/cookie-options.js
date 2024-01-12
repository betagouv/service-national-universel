const config = require("./config");

//!COOKIE need to be in milliseconds
const COOKIE_SIGNIN_MAX_AGE_MS = 60 * 60 * 2 * 1000; // 2h
const COOKIE_SNUPPORT_MAX_AGE_MS = 60 * 60 * 2 * 1000; //2h
const COOKIE_TRUST_TOKEN_JWT_MAX_AGE_MS = 60 * 60 * 24 * 30 * 1000; // 1 mois
//!COOKIE need to be in milliseconds

function cookieOptions(maxAge) {
  if (config.ENVIRONMENT === "development") {
    return { maxAge, httpOnly: true, secure: false, domain: "localhost", sameSite: "Lax" };
  } else if (config.ENVIRONMENT === "staging") {
    // Because we need a valid subdomain (does not work with cleverapps.io).
    return { maxAge, httpOnly: true, secure: true, domain: ".beta-snu.dev", sameSite: "Lax" };
  } else {
    return { maxAge, httpOnly: true, secure: true, domain: ".snu.gouv.fr", sameSite: "Lax" };
  }
}

module.exports = {
  cookieOptions,
  COOKIE_SIGNIN_MAX_AGE_MS,
  COOKIE_SNUPPORT_MAX_AGE_MS,
  COOKIE_TRUST_TOKEN_JWT_MAX_AGE_MS,
};
