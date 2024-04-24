const config = require("./config");
const { JWT_SIGNIN_MAX_AGE_SEC, JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC, JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC } = require("./jwt-options");

//!COOKIE need to be in milliseconds
const COOKIE_SIGNIN_MAX_AGE_MS = JWT_SIGNIN_MAX_AGE_SEC * 1000;
const COOKIE_SNUPPORT_MAX_AGE_MS = 60 * 60 * 2 * 1000; //2h
const COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS = JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC * 1000;
const COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS = JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC * 1000;
//!COOKIE need to be in milliseconds

function cookieOptions(maxAge) {
  if (config.ENVIRONMENT === "development") {
    return { maxAge, httpOnly: true, secure: false, domain: "localhost", sameSite: "Lax" };
  } else if (config.ENVIRONMENT === "staging") {
    // Because we need a valid subdomain (does not work with cleverapps.io).
    console.log("-fix-customenv.functions.fnc.fr-par.scw.cloud")
    return { maxAge, httpOnly: true, secure: true, domain: "-fix-customenv.functions.fnc.fr-par.scw.cloud", sameSite: "Lax" };
  } else {
    return { maxAge, httpOnly: true, secure: true, domain: ".snu.gouv.fr", sameSite: "Lax" };
  }
}

module.exports = {
  cookieOptions,
  COOKIE_SIGNIN_MAX_AGE_MS,
  COOKIE_SNUPPORT_MAX_AGE_MS,
  COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS,
  COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS,
};
