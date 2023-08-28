const environment = import.meta.env.MODE;

let apiURL = "http://localhost:8080";
let adminURL = "http://localhost:8082";
let appURL = "http://localhost:8081";
// knowledgeBase URL
let supportURL = "http://localhost:8084";
let maintenance = false;
let SENTRY_URL = "";
let SENTRY_TRACING_SAMPLE_RATE = 1.0;
let SENTRY_SESSION_SAMPLE_RATE = 1.0;
let SENTRY_ON_ERROR_SAMPLE_RATE = 1.0;

if (environment === "staging") {
  apiURL = "https://api.beta-snu.dev";
  adminURL = "https://admin.beta-snu.dev";
  appURL = "https://moncompte.beta-snu.dev";
  // knowledgeBase URL
  supportURL = "https://support.beta-snu.dev";
  SENTRY_URL = "https://c5165ba99b4f4f2d8f1d4c0b16a654db@sentry.selego.co/14";
  SENTRY_TRACING_SAMPLE_RATE = 1.0;
  SENTRY_SESSION_SAMPLE_RATE = 0.5;
  SENTRY_ON_ERROR_SAMPLE_RATE = 1.0;
}
if (environment === "production") {
  apiURL = "https://api.snu.gouv.fr";
  adminURL = "https://admin.snu.gouv.fr";
  appURL = "https://moncompte.snu.gouv.fr";
  // knowledgeBase URL
  supportURL = "https://support.snu.gouv.fr";
  SENTRY_URL = "https://d09670865360498e9567369808de4064@sentry.selego.co/13";
  SENTRY_TRACING_SAMPLE_RATE = 0.01;
  SENTRY_SESSION_SAMPLE_RATE = 0.1;
  SENTRY_ON_ERROR_SAMPLE_RATE = 1.0;
}

const S3PREFIX = "";

let franceConnectUrl = "https://fcp.integ01.dev-franceconnect.fr/api/v1";

if (environment === "production") {
  franceConnectUrl = "https://app.franceconnect.gouv.fr/api/v1";
}

export {
  apiURL,
  S3PREFIX,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
  SENTRY_SESSION_SAMPLE_RATE,
  SENTRY_ON_ERROR_SAMPLE_RATE,
  environment,
  franceConnectUrl,
  adminURL,
  appURL,
  supportURL,
  maintenance,
};
