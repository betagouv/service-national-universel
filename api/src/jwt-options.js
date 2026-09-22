//!TOKEN need to be in seconds
const JWT_SIGNIN_MAX_AGE_SEC = 60 * 60 * 2; // 2h
const JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC = 60 * 60 * 24 * 30 * 6; // 6 mois
const JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 1 mois
//!TOKEN need to be in seconds

// ! If you upgrade this, all jwt will be invalid
const JWT_SIGNIN_VERSION = "0";
// ! v1 : le trust token porte désormais le compte auquel il est lié (type/_id/passwordChangedAt).
// ! Les trust tokens v0 (non liés) sont invalidés : un 2FA sera redemandé une fois.
const JWT_TRUST_TOKEN_VERSION = "1";

// Distingue un trust token d'un JWT de session : sans ce champ, un token de session
// signé avec le même secret passe la vérification du trust token (confusion de type).
const JWT_TRUST_TOKEN_TYPE = "trust";

const checkJwtSigninVersion = (token) => token?.__v === JWT_SIGNIN_VERSION;
const checkJwtTrustTokenVersion = (token) => token?.__v === JWT_TRUST_TOKEN_VERSION;

module.exports = {
  JWT_SIGNIN_MAX_AGE_SEC,
  JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC,
  JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC,
  JWT_SIGNIN_VERSION,
  JWT_TRUST_TOKEN_VERSION,
  JWT_TRUST_TOKEN_TYPE,
  checkJwtSigninVersion,
  checkJwtTrustTokenVersion,
};
