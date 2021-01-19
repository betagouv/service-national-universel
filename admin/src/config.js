const forceProd = false;

const environment = getEnvironment();
let apiURL = "http://localhost:8080";

if (environment === "staging") {
  apiURL = "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
}
if (environment === "production") {
  apiURL = "https://app-5a3e097d-fdf1-44fa-9172-88ad9d7b2b20.cleverapps.io";
}
const S3PREFIX = "";
const SENTRY_URL = "https://415a2c2d9246422fa05cd5e96dd39c23@o348403.ingest.sentry.io/5557988";

function getEnvironment() {
  if (window.location.href.indexOf("localhost") !== -1 || window.location.href.indexOf("127.0.0.1") !== -1) return "development";
  if (window.location.href.indexOf("app-735c50af-69c1-4a10-ac30-7ba11d1112f7.cleverapps.io") !== -1) return "staging";
  return "production";
}

export { apiURL, S3PREFIX, SENTRY_URL, environment };
