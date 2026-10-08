const { config } = require("./config");

const CREDENTIALS_ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Referer", "User-Agent", "sentry-trace", "baggage", "x-user-timezone"];

// PL5 (25/09/2026) : le CORS à credentials (cookies de session, JWT en en-tête) n'est ouvert sur
// toute l'API qu'à app et admin. KNOWLEDGEBASE_URL et SUPPORT_FRONT_URL reçoivent un CORS dédié,
// limité à leurs routes précises. SUPPORT_URL (appel serveur à serveur snupport-api) n'a jamais eu
// besoin de CORS, et l'hôte "https://inscription.snu.gouv.fr" (2021) codé en dur est mort.
//
// La base de connaissance appelle l'API v1 sur trois routes, toujours avec `credentials: "include"`
// (knowledge-base-public/src/services/api.js) : sans Access-Control-Allow-Credentials, le
// navigateur rejette le preflight (régression du 26/09/2026, GOO-201). /signin/token et
// /signin/logout lisent le cookie de session, seule preuve du lecteur (controllers/signin.js) ;
// le reste de l'API l'ignore depuis l'origine de la KB (passport.getToken, FH16), si bien que le
// retour sur un article reste anonyme. Méthodes et en-têtes sont limités à ce que la KB envoie
// (plus ceux de Sentry, si son traçage y est réactivé).
const KNOWLEDGE_BASE_ALLOWED_HEADERS = ["Content-Type", "Accept", "sentry-trace", "baggage"];
const knowledgeBaseRoute = (path, method) => ({
  path,
  getOptions: () => ({ origin: config.KNOWLEDGEBASE_URL, credentials: true, methods: [method], allowedHeaders: KNOWLEDGE_BASE_ALLOWED_HEADERS }),
});

const DEDICATED_ROUTES = [
  knowledgeBaseRoute("/signin/token", "GET"),
  knowledgeBaseRoute("/signin/logout", "POST"),
  knowledgeBaseRoute("/SNUpport/knowledgeBase/feedback", "POST"),
  { path: "/cohort/public", getOptions: () => ({ origin: config.SUPPORT_FRONT_URL, credentials: false }) },
];

// Fonction déléguée (corsOptionsDelegate) plutôt que deux middlewares `cors()` empilés : un
// second `app.use(cors())` monté après le middleware global ne serait jamais atteint sur les
// requêtes preflight OPTIONS, le premier y répondant (204) avant de leur laisser la main.
function corsOptionsDelegate(req, callback) {
  const dedicatedRoute = DEDICATED_ROUTES.find((route) => req.path === route.path);
  if (dedicatedRoute) {
    callback(null, dedicatedRoute.getOptions());
    return;
  }

  callback(null, {
    credentials: true,
    origin: [config.APP_URL, config.ADMIN_URL],
    allowedHeaders: CREDENTIALS_ALLOWED_HEADERS,
  });
}

module.exports = { corsOptionsDelegate, CREDENTIALS_ALLOWED_HEADERS };
