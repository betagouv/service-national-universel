//!TOKEN need to be in seconds
// 2 h, comme le cookie posé par l'API v1 au SSO : un jeton de 24 h volé restait une session durable (M98).
const JWT_MAX_AGE = 60 * 60 * 2; // 2 hours (in seconds)
//!TOKEN need to be in seconds

// ! If you upgrade this, all jwt will be invalid
// "1" : le jeton porte lastLogoutAt et passwordChangedAt (M98) ; les jetons de 24 h émis avant sont refusés.
const JWT_VERSION = "1";

const checkJwtVersion = (token) => token.__v === JWT_VERSION;

module.exports = {
  JWT_MAX_AGE,
  JWT_VERSION,
  checkJwtVersion,
};
