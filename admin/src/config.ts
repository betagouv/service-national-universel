function getEnv(name: string, fallback?: string | number | boolean) {
  const runtime = globalThis.runtime_env || {};
  let v = runtime[name];
  if (v !== undefined && v !== "") {
    return v;
  }
  // @ts-expect-error import.meta
  v = import.meta.env[`VITE_${name}`];
  if (v !== undefined && v !== "") {
    return v;
  }
  if (fallback === undefined) {
    console.warn(`Environment variable ${name} is not defined`);
  }
  return fallback;
}

const apiURL = getEnv("API_URL", "http://localhost:8080");
const appURL = getEnv("APP_URL", "http://localhost:8081");
const adminURL = getEnv("ADMIN_URL", "http://localhost:8082");
const supportURL = getEnv("SUPPORT_URL", "http://localhost:8083");
const maintenance = getEnv("MAINTENANCE", false) === "true";
const environment: "production" | "staging" | "ci" | "custom" | "test" | "development" = getEnv("ENVIRONMENT", "development");
const RELEASE = getEnv("RELEASE");
const SENTRY_URL = getEnv("SENTRY_URL", "https://70778e8aa9a6f1b9f483a8b6c9046a12@sentry.selego.co/140");
const SENTRY_TRACING_SAMPLE_RATE = getEnv("SENTRY_TRACING_SAMPLE_RATE", 0.1);
const SENTRY_SESSION_SAMPLE_RATE = getEnv("SENTRY_SESSION_SAMPLE_RATE", 0.1);
const SENTRY_ON_ERROR_SAMPLE_RATE = getEnv("SENTRY_ON_ERROR_SAMPLE_RATE", 1);

export { apiURL, appURL, RELEASE, SENTRY_URL, SENTRY_TRACING_SAMPLE_RATE, SENTRY_SESSION_SAMPLE_RATE, SENTRY_ON_ERROR_SAMPLE_RATE, environment, adminURL, supportURL, maintenance };
