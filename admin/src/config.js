const forceProd = false;

const environment = import.meta.env.MODE;
let apiURL = "http://localhost:8080";
let appURL = "http://localhost:8081";
let adminURL = "http://localhost:8082";
let supportURL = "http://localhost:8083";
let maintenance = false;
let SENTRY_URL = "https://c5165ba99b4f4f2d8f1d4c0b16a654db@sentry.selego.co/14";
let SENTRY_TRACING_SAMPLE_RATE = 1.0;

if (environment === "staging") {
  apiURL = "https://api.beta-snu.dev";
  appURL = "https://moncompte.beta-snu.dev";
  adminURL = "https://admin.beta-snu.dev";
  supportURL = "https://app-9266b532-ff6e-4a6a-aeeb-e6ff7bb67f60.cleverapps.io";
  SENTRY_URL = "https://c5165ba99b4f4f2d8f1d4c0b16a654db@sentry.selego.co/14";
  SENTRY_TRACING_SAMPLE_RATE = 1.0;
}
if (environment === "production") {
  apiURL = "https://api.snu.gouv.fr";
  appURL = "https://moncompte.snu.gouv.fr";
  adminURL = "https://admin.snu.gouv.fr";
  supportURL = "https://support.snu.gouv.fr";
  SENTRY_URL = "https://d09670865360498e9567369808de4064@sentry.selego.co/13";
  SENTRY_TRACING_SAMPLE_RATE = 0.01;
}
const S3PREFIX = "";

export { apiURL, appURL, S3PREFIX, SENTRY_URL, SENTRY_TRACING_SAMPLE_RATE, environment, adminURL, supportURL, maintenance };
