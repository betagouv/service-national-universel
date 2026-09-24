import { envStr, envFloat, envBool } from "snu-lib";

function _env<T>(callback: (value: any, fallback?: T) => T, key: string, fallback?: T) {
  try {
    // @ts-expect-error import.meta
    return callback(import.meta.env[key], fallback);
  } catch (error) {
    console.warn(`Environment ${key}: ${error.message}`);
  }
  return undefined;
}

// Repli « development » réservé au serveur de dev : un build sans VITE_ENVIRONMENT échoue (vite.config.js).
// @ts-expect-error import.meta
const isDevServer: boolean = import.meta.env.DEV === true;

const RELEASE = _env(envStr, "VITE_RELEASE", "development");
const environment: "production" | "staging" | "ci" | "custom" | "test" | "development" = _env(envStr, "VITE_ENVIRONMENT", isDevServer ? "development" : undefined);
const apiURL = _env(envStr, "VITE_API_URL", "http://localhost:8080");
const apiv2URL = _env(envStr, "VITE_APIV2_URL", "http://localhost:8086");
const appURL = _env(envStr, "VITE_APP_URL", "http://localhost:8081");
const adminURL = _env(envStr, "VITE_ADMIN_URL", "http://localhost:8082");
const supportURL = _env(envStr, "VITE_SUPPORT_URL", "http://localhost:8083");
const knowledgebaseURL = _env(envStr, "VITE_KNOWLEDGEBASE_URL", "http://localhost:8084");
const maintenance = _env(envBool, "VITE_MAINTENANCE", false);
const SENTRY_TRACING_SAMPLE_RATE = _env(envFloat, "VITE_SENTRY_TRACING_SAMPLE_RATE", 0.1);
const SENTRY_DEBUG_MODE = _env(envBool, "SENTRY_DEBUG_MODE", false);

export {
  apiURL,
  apiv2URL,
  appURL,
  RELEASE,
  SENTRY_TRACING_SAMPLE_RATE,
  SENTRY_DEBUG_MODE,
  environment,
  adminURL,
  supportURL,
  knowledgebaseURL,
  maintenance,
};
