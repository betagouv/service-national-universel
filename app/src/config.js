const environment = getEnvironment();

let apiURL = "http://localhost:8080";
let adminURL = "http://localhost:8082";
let appURL = "http://localhost:8081";
let supportURL = "http://localhost:8083";
let educonnectAllowed = true;
let maintenance = false;
let SENTRY_URL = "https://c5165ba99b4f4f2d8f1d4c0b16a654db@sentry.selego.co/14";
let SENTRY_TRACING_SAMPLE_RATE = 1.0;

if (environment === "staging") {
  apiURL = "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  adminURL = "https://app-735c50af-69c1-4a10-ac30-7ba11d1112f7.cleverapps.io";
  appURL = "https://app-66aba4d6-e5fc-4c74-b252-f55fb0e9d37f.cleverapps.io";
  supportURL = "https://app-9266b532-ff6e-4a6a-aeeb-e6ff7bb67f60.cleverapps.io";
  SENTRY_URL = "https://c5165ba99b4f4f2d8f1d4c0b16a654db@sentry.selego.co/14";
  SENTRY_TRACING_SAMPLE_RATE = 0.5;
}
if (environment === "production") {
  apiURL = "https://api.snu.gouv.fr";
  adminURL = "https://admin.snu.gouv.fr";
  appURL = "https://moncompte.snu.gouv.fr";
  supportURL = "https://support.snu.gouv.fr";
  educonnectAllowed = false;
  SENTRY_URL = "https://d09670865360498e9567369808de4064@sentry.selego.co/13";
  SENTRY_TRACING_SAMPLE_RATE = 0.5;
}

const S3PREFIX = "";

let franceConnectUrl = "https://fcp.integ01.dev-franceconnect.fr/api/v1";

if (environment === "production") {
  franceConnectUrl = "https://app.franceconnect.gouv.fr/api/v1";
}

function getEnvironment() {
  if (window.location.href.indexOf("localhost") !== -1 || window.location.href.indexOf("127.0.0.1") !== -1) return "development";
  if (window.location.href.indexOf("app-66aba4d6-e5fc-4c74-b252-f55fb0e9d37f.cleverapps.io") !== -1) return "staging";
  return "production";
}

export { apiURL, S3PREFIX, SENTRY_URL, SENTRY_TRACING_SAMPLE_RATE, environment, franceConnectUrl, adminURL, appURL, supportURL, educonnectAllowed, maintenance };
