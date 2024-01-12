const environment = import.meta.env.MODE;
let apiURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
let appURL = import.meta.env.VITE_APP_URL ?? "http://localhost:8081";
let adminURL = import.meta.env.VITE_ADMIN_URL ?? "http://localhost:8082";
let supportURL = import.meta.env.VITE_SUPPORT_URL ?? "http://localhost:8083";
let maintenance = import.meta.env.VITE_MAINTENANCE === "true";
let SENTRY_URL = import.meta.env.VITE_SENTRY_URL;
let SENTRY_TRACING_SAMPLE_RATE = import.meta.env.VITE_SENTRY_TRACING_SAMPLE_RATE ?? 1.0;
let SENTRY_SESSION_SAMPLE_RATE = import.meta.env.VITE_SENTRY_SESSION_SAMPLE_RATE ?? 1.0;
let SENTRY_ON_ERROR_SAMPLE_RATE = import.meta.env.VITE_SENTRY_ON_ERROR_SAMPLE_RATE ?? 1.0;

export { apiURL, appURL, SENTRY_URL, SENTRY_TRACING_SAMPLE_RATE, SENTRY_SESSION_SAMPLE_RATE, SENTRY_ON_ERROR_SAMPLE_RATE, environment, adminURL, supportURL, maintenance };
