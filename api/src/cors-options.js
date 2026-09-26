const { config } = require("./config");

const CREDENTIALS_ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Referer", "User-Agent", "sentry-trace", "baggage", "x-user-timezone"];

// PL5 (25/09/2026) : le CORS à credentials (cookies de session, JWT en en-tête) n'est nécessaire
// que pour app et admin. KNOWLEDGEBASE_URL (lecture seule sur /signin/token et /signin/logout) et
// SUPPORT_FRONT_URL (page publique /cohort/public) reçoivent un CORS dédié sans credentials,
// limité à ces routes précises. SUPPORT_URL (appel serveur à serveur snupport-api) n'a jamais eu
// besoin de CORS, et l'hôte "https://inscription.snu.gouv.fr" (2021) codé en dur est mort.
const NO_CREDENTIALS_ROUTES = [
  { path: "/signin/token", getOrigin: () => config.KNOWLEDGEBASE_URL },
  { path: "/signin/logout", getOrigin: () => config.KNOWLEDGEBASE_URL },
  { path: "/cohort/public", getOrigin: () => config.SUPPORT_FRONT_URL },
];

// Fonction déléguée (corsOptionsDelegate) plutôt que deux middlewares `cors()` empilés : un
// second `app.use(cors())` monté après le middleware global ne serait jamais atteint sur les
// requêtes preflight OPTIONS, le premier y répondant (204) avant de leur laisser la main.
function corsOptionsDelegate(req, callback) {
  const dedicatedRoute = NO_CREDENTIALS_ROUTES.find((route) => req.path === route.path);
  if (dedicatedRoute) {
    callback(null, { credentials: false, origin: dedicatedRoute.getOrigin() });
    return;
  }

  callback(null, {
    credentials: true,
    origin: [config.APP_URL, config.ADMIN_URL],
    allowedHeaders: CREDENTIALS_ALLOWED_HEADERS,
  });
}

module.exports = { corsOptionsDelegate, CREDENTIALS_ALLOWED_HEADERS };
