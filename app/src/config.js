const environment = import.meta.env.MODE;
let apiURL = import.meta.env.API_URL ?? "http://localhost:8080";
let appURL = import.meta.env.APP_URL ?? "http://localhost:8081";
let adminURL = import.meta.env.ADMIN_URL ?? "http://localhost:8082";
let supportURL = import.meta.env.SUPPORT_URL ?? "http://localhost:8083";
let maintenance = import.meta.env.VITE_MAINTENANCE === "true";
let SENTRY_URL = import.meta.env.SENTRY_URL;
let SENTRY_TRACING_SAMPLE_RATE = import.meta.env.SENTRY_TRACING_SAMPLE_RATE ?? 1.0;
let SENTRY_SESSION_SAMPLE_RATE = import.meta.env.SENTRY_SESSION_SAMPLE_RATE ?? 1.0;
let SENTRY_ON_ERROR_SAMPLE_RATE = import.meta.env.SENTRY_ON_ERROR_SAMPLE_RATE ?? 1.0;

let franceConnectUrl = import.meta.env.FRANCE_CONNECT_URL ?? "https://fcp.integ01.dev-franceconnect.fr/api/v1";

export {
  apiURL,
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
