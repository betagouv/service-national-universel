const { config } = require("./config");

const CREDENTIALS_ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Referer", "User-Agent", "sentry-trace", "baggage", "x-user-timezone"];

// PL5 (25/09/2026) : le CORS à credentials (cookies de session, JWT en en-tête) n'est ouvert sur
// toute l'API qu'à app et admin. KNOWLEDGEBASE_URL et SUPPORT_FRONT_URL reçoivent un CORS dédié,
// limité à leurs routes précises. SUPPORT_URL (appel serveur à serveur snupport-api) n'a jamais eu
// besoin de CORS, et l'hôte "https://inscription.snu.gouv.fr" (2021) codé en dur est mort.
//
// /signin/token et /signin/logout gardent les credentials : la base de connaissance les appelle
// avec `credentials: "include"`, le cookie de session étant la seule preuve du lecteur
// (controllers/signin.js). Sans Access-Control-Allow-Credentials, le navigateur rejette le
// preflight et chaque lecteur connecté retombe en visiteur public (régression du 26/09/2026).
// Le reste de l'API ignore ce cookie depuis l'origine de la KB (passport.getToken, FH16).
const DEDICATED_ROUTES = [
  { path: "/signin/token", getOrigin: () => config.KNOWLEDGEBASE_URL, credentials: true },
  { path: "/signin/logout", getOrigin: () => config.KNOWLEDGEBASE_URL, credentials: true },
  { path: "/cohort/public", getOrigin: () => config.SUPPORT_FRONT_URL, credentials: false },
];

// Fonction déléguée (corsOptionsDelegate) plutôt que deux middlewares `cors()` empilés : un
// second `app.use(cors())` monté après le middleware global ne serait jamais atteint sur les
// requêtes preflight OPTIONS, le premier y répondant (204) avant de leur laisser la main.
function corsOptionsDelegate(req, callback) {
  const dedicatedRoute = DEDICATED_ROUTES.find((route) => req.path === route.path);
  if (dedicatedRoute) {
    callback(null, { credentials: dedicatedRoute.credentials, origin: dedicatedRoute.getOrigin() });
    return;
  }

  callback(null, {
    credentials: true,
    origin: [config.APP_URL, config.ADMIN_URL],
    allowedHeaders: CREDENTIALS_ALLOWED_HEADERS,
  });
}

module.exports = { corsOptionsDelegate, CREDENTIALS_ALLOWED_HEADERS };
