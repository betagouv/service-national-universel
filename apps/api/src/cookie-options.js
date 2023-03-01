const config = require("./config");

// It seems session length is broken, we should investigate.
const COOKIE_MAX_AGE = 60 * 60 * 2 * 1000; // 2h
const JWT_MAX_AGE = 60 * 60 * 2; // 2h

function cookieOptions() {
  if (config.ENVIRONMENT === "development") {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: false, domain: "localhost", sameSite: "Lax" };
  } else if (config.ENVIRONMENT === "staging") {
    // Because we need a valid subdomain (does not work with cleverapps.io).
    // Should be fixed when we have a subdomain from gouv.fr.
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: true, sameSite: "none" };
  } else {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: true, domain: ".snu.gouv.fr", sameSite: "Lax" };
  }
}
function logoutCookieOptions() {
  if (config.ENVIRONMENT === "development") {
    return { httpOnly: true, secure: false };
  } else if (config.ENVIRONMENT === "staging") {
    return { httpOnly: true, secure: true, sameSite: "none" };
  } else {
    return { httpOnly: true, secure: true, domain: ".snu.gouv.fr", sameSite: "Lax" };
  }
}

module.exports = {
  cookieOptions,
  COOKIE_MAX_AGE,
  JWT_MAX_AGE,
  logoutCookieOptions,
};
