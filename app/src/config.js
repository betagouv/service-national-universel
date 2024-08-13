function getEnv(name, fallback = undefined) {
  const runtime = globalThis.runtime_env || {};
  let v = runtime[name];
  if (v !== undefined && v !== "") {
    return v;
  }
  v = import.meta.env[`VITE_${name}`];
  if (v !== undefined && v !== "") {
    return v;
  }
  if (fallback === undefined) {
    console.warn(`Environment variable ${name} is not defined`);
  }
  return fallback;
}

let RELEASE = getEnv("RELEASE");
let apiURL = getEnv("API_URL", "http://localhost:8080");
let appURL = getEnv("APP_URL", "http://localhost:8081");
let adminURL = getEnv("ADMIN_URL", "http://localhost:8082");
let supportURL = getEnv("SUPPORT_URL", "http://localhost:8083");
let maintenance = getEnv("MAINTENANCE", false) === "true";
let environment = getEnv("ENVIRONMENT", "development");
let SENTRY_TRACING_SAMPLE_RATE = getEnv("SENTRY_TRACING_SAMPLE_RATE", 0.1);
let SENTRY_SESSION_SAMPLE_RATE = getEnv("SENTRY_SESSION_SAMPLE_RATE", 0.1);
let SENTRY_ON_ERROR_SAMPLE_RATE = getEnv("SENTRY_ON_ERROR_SAMPLE_RATE", 1.0);
let franceConnectUrl = getEnv("FRANCE_CONNECT_URL", "https://fcp.integ01.dev-franceconnect.fr/api/v1");
let API_ENGAGEMENT_URL = getEnv("API_ENGAGEMENT_URL", "https://api.api-engagement.beta.gouv.fr");
let API_ENGAGEMENT_SNU_ID = getEnv("API_ENGAGEMENT_SNU_ID", "60574864aee4bd176f26a540");

export {
  apiURL,
  RELEASE,
  SENTRY_TRACING_SAMPLE_RATE,
  SENTRY_SESSION_SAMPLE_RATE,
  SENTRY_ON_ERROR_SAMPLE_RATE,
  environment,
  franceConnectUrl,
  API_ENGAGEMENT_URL,
  API_ENGAGEMENT_SNU_ID,
  adminURL,
  appURL,
  supportURL,
  maintenance,
};
