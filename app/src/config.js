function getEnv(name) {
  const v = import.meta.env[name];
  if (v === undefined || v === "") {
    console.error(`Environment variable ${name} is not defined`);
  }
  return v;
}

let RELEASE = getEnv("VITE_RELEASE");
let apiURL = getEnv("VITE_API_URL");
let appURL = getEnv("VITE_APP_URL");
let adminURL = getEnv("VITE_ADMIN_URL");
let supportURL = getEnv("VITE_SUPPORT_URL");
let maintenance = getEnv("VITE_MAINTENANCE") === "true";
let environment = getEnv("VITE_ENVIRONMENT");
let SENTRY_TRACING_SAMPLE_RATE = getEnv("VITE_SENTRY_TRACING_SAMPLE_RATE");
let SENTRY_SESSION_SAMPLE_RATE = getEnv("VITE_SENTRY_SESSION_SAMPLE_RATE");
let SENTRY_ON_ERROR_SAMPLE_RATE = getEnv("VITE_SENTRY_ON_ERROR_SAMPLE_RATE");
let franceConnectUrl = getEnv("VITE_FRANCE_CONNECT_URL");
let API_ENGAGEMENT_URL = getEnv("VITE_API_ENGAGEMENT_URL");
let API_ENGAGEMENT_SNU_ID = getEnv("VITE_API_ENGAGEMENT_SNU_ID");

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
