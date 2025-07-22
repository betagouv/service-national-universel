//!TOKEN need to be in seconds
const JWT_MAX_AGE = 60 * 60 * 24; // 1 day (in seconds)
//!TOKEN need to be in seconds

// ! If you upgrade this, all jwt will be invalid
const JWT_VERSION = "0";

const checkJwtVersion = (token) => token.__v === JWT_VERSION;

module.exports = {
  JWT_MAX_AGE,
  JWT_VERSION,
  checkJwtVersion,
};
