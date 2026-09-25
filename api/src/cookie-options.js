const { config } = require("./config");
const { JWT_SIGNIN_MAX_AGE_SEC, JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC, JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC } = require("./jwt-options");

//!COOKIE need to be in milliseconds
const COOKIE_SIGNIN_MAX_AGE_MS = JWT_SIGNIN_MAX_AGE_SEC * 1000;
const COOKIE_SNUPPORT_MAX_AGE_MS = 60 * 60 * 2 * 1000; //2h
const COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS = JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC * 1000;
const COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS = JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC * 1000;
//!COOKIE need to be in milliseconds

// SameSite=Strict (L26, audit du 21/09/2026) : les fronts (admin, moncompte, support, KB) partagent le site de l'API
// (snu.gouv.fr, beta-snu.dev), leurs appels restent donc same-site et emportent le cookie. Un site tiers ne peut plus le
// faire envoyer, même sur une navigation GET. Le retour SSO de JVA (navigation venue de jeveuxaider.gouv.fr) pose le
// cookie puis redirige vers l'admin : un cookie Strict est bien accepté sur cette réponse, il n'est simplement pas
// renvoyé avant le premier appel de l'admin, qui est same-site.
// Le domaine parent est conservé : un cookie limité à l'hôte de l'API reste à l'étude (GOO-16).
// Les recettes (`custom`) servent fronts et API sur des domaines distincts : elles restent en SameSite=None.
function cookieOptions(maxAge) {
  switch (config.ENVIRONMENT) {
    case "test":
    case "development":
      return { maxAge, httpOnly: true, secure: false, domain: "localhost", sameSite: "Lax" };
    case "staging":
    case "ci":
      return { maxAge, httpOnly: true, secure: true, domain: ".beta-snu.dev", sameSite: "Strict" };
    case "production":
      return { maxAge, httpOnly: true, secure: true, domain: ".snu.gouv.fr", sameSite: "Strict" };
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
