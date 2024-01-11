//!TOKEN need to be in seconds
const JWT_SIGNIN_MAX_AGE_S = 60 * 60 * 2; // 2h
const JWT_TRUST_TOKEN_MAX_AGE_S = 60 * 60 * 24 * 30; // 1 mois
//!TOKEN need to be in seconds

// ! If you upgrade this, all jwt will be invalid
const JWT_SIGNIN_VERSION = "0";
const JWT_TRUST_TOKEN_VERSION = "0";

const checkJwtSigninVersion = (token) => token.__v === JWT_SIGNIN_VERSION;
const checkJwtTrustTokenVersion = (token) => token.__v === JWT_TRUST_TOKEN_VERSION;

module.exports = {
  JWT_SIGNIN_MAX_AGE_S,
  JWT_TRUST_TOKEN_MAX_AGE_S,
  JWT_SIGNIN_VERSION,
  JWT_TRUST_TOKEN_VERSION,
  checkJwtSigninVersion,
  checkJwtTrustTokenVersion,
};
