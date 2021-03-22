const forceProd = false;

const environment = getEnvironment();

let apiURL = "http://localhost:8080";
let LUMIERE_APP_ID = "app_1i-pkr9c9sY-6k1ML5o8_";

if (environment === "staging") {
  apiURL = "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
}
if (environment === "production") {
  apiURL = "https://app-5a3e097d-fdf1-44fa-9172-88ad9d7b2b20.cleverapps.io";
  LUMIERE_APP_ID = "app_Pemqr1RIvcJ9lVNp_zeVF";
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

export { apiURL, S3PREFIX, SENTRY_URL, environment, franceConnectUrl, LUMIERE_APP_ID };
