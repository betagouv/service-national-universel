function getEnv(name: string) {
  // @ts-expect-error import.meta
  const v = import.meta.env[name];
  if (v === undefined || v === "") {
    console.error(`Environment variable ${name} is not defined`);
  }
  return v;
}

const apiURL = getEnv("VITE_API_URL");
const appURL = getEnv("VITE_APP_URL");
const adminURL = getEnv("VITE_ADMIN_URL");
const supportURL = getEnv("VITE_SUPPORT_URL");
const maintenance = getEnv("VITE_MAINTENANCE") === "true";
const environment: "production" | "staging" | "ci" | "custom" | "test" | "development" = getEnv("VITE_ENVIRONMENT");
const RELEASE = getEnv("VITE_RELEASE");
const SENTRY_TRACING_SAMPLE_RATE = getEnv("VITE_SENTRY_TRACING_SAMPLE_RATE");
const SENTRY_SESSION_SAMPLE_RATE = getEnv("VITE_SENTRY_SESSION_SAMPLE_RATE");
const SENTRY_ON_ERROR_SAMPLE_RATE = getEnv("VITE_SENTRY_ON_ERROR_SAMPLE_RATE");

export { apiURL, appURL, RELEASE, SENTRY_TRACING_SAMPLE_RATE, SENTRY_SESSION_SAMPLE_RATE, SENTRY_ON_ERROR_SAMPLE_RATE, environment, adminURL, supportURL, maintenance };
