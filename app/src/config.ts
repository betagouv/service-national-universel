import { envStr, envFloat, envBool } from "snu-lib";

// @ts-expect-error import.meta
const getEnv = envStr.bind(null, import.meta.env);
// @ts-expect-error import.meta
const getEnvBool = envBool.bind(null, import.meta.env);
// @ts-expect-error import.meta
const getEnvFloat = envFloat.bind(null, import.meta.env);

const RELEASE = getEnv("VITE_RELEASE", "development");
const environment = getEnv("VITE_ENVIRONMENT", "development");
const apiURL = getEnv("VITE_API_URL", "http://localhost:8080");
const appURL = getEnv("VITE_APP_URL", "http://localhost:8081");
const adminURL = getEnv("VITE_ADMIN_URL", "http://localhost:8082");
const supportURL = getEnv("VITE_SUPPORT_URL", "http://localhost:8083");
const maintenance = getEnvBool("VITE_MAINTENANCE", false);
const SENTRY_TRACING_SAMPLE_RATE = getEnvFloat("VITE_SENTRY_TRACING_SAMPLE_RATE", 0.1);
const SENTRY_SESSION_SAMPLE_RATE = getEnvFloat("VITE_SENTRY_SESSION_SAMPLE_RATE", 0.1);
const SENTRY_ON_ERROR_SAMPLE_RATE = getEnvFloat("VITE_SENTRY_ON_ERROR_SAMPLE_RATE", 1.0);
const franceConnectUrl = getEnv("VITE_FRANCE_CONNECT_URL", "https://fcp.integ01.dev-franceconnect.fr/api/v1");
const API_ENGAGEMENT_URL = getEnv("VITE_API_ENGAGEMENT_URL", "https://api.api-engagement.beta.gouv.fr");
const API_ENGAGEMENT_SNU_ID = getEnv("VITE_API_ENGAGEMENT_SNU_ID", "60574864aee4bd176f26a540");

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
