const forceProd = false;

const environment = getEnvironment();

let apiURL = "http://localhost:8080";
let adminURL = "http://localhost:8082";

if (environment === "staging") {
  apiURL = "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  adminURL = "https://app-735c50af-69c1-4a10-ac30-7ba11d1112f7.cleverapps.io";
}
if (environment === "production") {
  apiURL = "https://api.snu.gouv.fr";
  adminURL = "https://admin.snu.gouv.fr";
}

const S3PREFIX = "";
const SENTRY_URL = "https://415a2c2d9246422fa05cd5e96dd39c23@o348403.ingest.sentry.io/5557988";

let franceConnectUrl = "https://fcp.integ01.dev-franceconnect.fr/api/v1";

if (environment === "production") {
  franceConnectUrl = "https://app.franceconnect.gouv.fr/api/v1";
}

function getEnvironment() {
  if (window.location.href.indexOf("localhost") !== -1 || window.location.href.indexOf("127.0.0.1") !== -1) return "development";
  if (window.location.href.indexOf("app-66aba4d6-e5fc-4c74-b252-f55fb0e9d37f.cleverapps.io") !== -1) return "staging";
  return "production";
}

export { apiURL, S3PREFIX, SENTRY_URL, environment, franceConnectUrl, adminURL };
