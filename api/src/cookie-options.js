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
// Les recettes (`custom`) servent fronts et API sur des domaines distincts : elles restent en SameSite=None.
//
// Cookie limité à l'hôte de l'API (GOO-16) : sans attribut Domain, `jwt_ref`, `jwt_young` et `trust_token-*` ne sont
// plus envoyés aux autres sous-domaines (moncompte, admin, support, KB…). Seuls l'API v1 et l'apiv2 les lisent, et
// elles partagent le même hôte (`api.snu.gouv.fr` et `api.snu.gouv.fr/v2`, idem en staging et en CI). Le cookie reste
// envoyé aux appels des fronts, puisque c'est l'hôte de la requête qui compte et non celui de la page.
const SHARED_PARENT_DOMAIN = {
  staging: ".beta-snu.dev",
  ci: ".beta-snu.dev",
  production: ".snu.gouv.fr",
};

function cookieOptions(maxAge) {
  switch (config.ENVIRONMENT) {
    case "test":
    case "development":
      return { maxAge, httpOnly: true, secure: false, domain: "localhost", sameSite: "Lax" };
    case "staging":
    case "ci":
    case "production":
      return { maxAge, httpOnly: true, secure: true, sameSite: "Strict" };
    default: //env custom
      return { maxAge, httpOnly: true, secure: true, sameSite: "None" };
  }
}

// Cookie lu par un autre hôte que celui de l'API : seul `jwtzamoud`, posé par l'API au SSO et lu par snupport-api.
function sharedCookieOptions(maxAge) {
  const domain = SHARED_PARENT_DOMAIN[config.ENVIRONMENT];
  return domain ? { ...cookieOptions(maxAge), domain } : cookieOptions(maxAge);
}

// Les navigateurs gardent jusqu'à expiration les cookies posés sur le domaine parent avant GOO-16. Un cookie de même
// nom limité à l'hôte ne les remplace pas : les deux seraient envoyés, et l'ancien, plus vieux, est lu en premier. Une
// déconnexion laisserait aussi l'ancien en place. On l'expire donc à chaque pose et à chaque effacement.
function expireLegacySharedCookie(res, name) {
  const domain = SHARED_PARENT_DOMAIN[config.ENVIRONMENT];
  if (domain) res.clearCookie(name, { ...cookieOptions(), domain });
}

function setSessionCookie(res, name, value, maxAge) {
  expireLegacySharedCookie(res, name);
  res.cookie(name, value, cookieOptions(maxAge));
}

function clearSessionCookie(res, name) {
  expireLegacySharedCookie(res, name);
  res.clearCookie(name, cookieOptions());
}

module.exports = {
  cookieOptions,
  sharedCookieOptions,
  setSessionCookie,
  clearSessionCookie,
  COOKIE_SIGNIN_MAX_AGE_MS,
  COOKIE_SNUPPORT_MAX_AGE_MS,
  COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS,
  COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS,
};
