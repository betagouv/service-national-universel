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

const RELEASE = _env(envStr, "VITE_RELEASE", "development");
const environment = _env(envStr, "VITE_ENVIRONMENT", "development");
const apiURL = _env(envStr, "VITE_API_URL", "http://localhost:8080");
const apiv2URL = _env(envStr, "VITE_APIV2_URL", "http://localhost:8086");
const appURL = _env(envStr, "VITE_APP_URL", "http://localhost:8081");
const adminURL = _env(envStr, "VITE_ADMIN_URL", "http://localhost:8082");
const supportURL = _env(envStr, "VITE_SUPPORT_URL", "http://localhost:8083");
const knowledgebaseURL = _env(envStr, "VITE_KNOWLEDGEBASE_URL", "http://localhost:8084");
const maintenance = _env(envBool, "VITE_MAINTENANCE", false);
const SENTRY_TRACING_SAMPLE_RATE = _env(envFloat, "VITE_SENTRY_TRACING_SAMPLE_RATE", 0.1);
const SENTRY_SESSION_SAMPLE_RATE = _env(envFloat, "VITE_SENTRY_SESSION_SAMPLE_RATE", 0.1);
const SENTRY_ON_ERROR_SAMPLE_RATE = _env(envFloat, "VITE_SENTRY_ON_ERROR_SAMPLE_RATE", 1.0);
const franceConnectUrl = _env(envStr, "VITE_FRANCE_CONNECT_URL", "https://fcp.integ01.dev-franceconnect.fr/api/v1");
const API_ENGAGEMENT_URL = _env(envStr, "VITE_API_ENGAGEMENT_URL", "https://api.api-engagement.beta.gouv.fr");
const API_ENGAGEMENT_SNU_ID = _env(envStr, "VITE_API_ENGAGEMENT_SNU_ID");

export {
  apiURL,
  apiv2URL,
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
  knowledgebaseURL,
  maintenance,
};
