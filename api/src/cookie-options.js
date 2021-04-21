const config = require("../config");

// It seems session length is broken, we should investigate.
const COOKIE_MAX_AGE = 60 * 60 * 2 * 1000; // 2h
const JWT_MAX_AGE = 60 * 60 * 2; // 2h

function cookieOptions() {
  if (config.ENVIRONMENT === "development") {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: false };
  } else {
    return { maxAge: COOKIE_MAX_AGE, httpOnly: true, secure: true, sameSite: "none" };
  }
}
function logoutCookieOptions() {
  if (config.ENVIRONMENT === "development") {
    return { httpOnly: true, secure: false };
  } else {
    return { httpOnly: true, secure: true, sameSite: "none" };
  }
}

module.exports = {
  cookieOptions,
  COOKIE_MAX_AGE,
  JWT_MAX_AGE,
  logoutCookieOptions,
};
