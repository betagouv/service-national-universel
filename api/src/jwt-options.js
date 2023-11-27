//!TOKEN need to be in seconds
const JWT_SIGNIN_MAX_AGE = 60 * 60 * 2; // 2h
const JWT_TRUST_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 1 mois
//!TOKEN need to be in seconds

module.exports = {
  JWT_SIGNIN_MAX_AGE,
  JWT_TRUST_TOKEN_MAX_AGE,
};
