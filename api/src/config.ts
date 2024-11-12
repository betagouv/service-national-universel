import process from "node:process";
import { envStr, envFloat, envBool, envInt } from "snu-lib";

function _env<T>(callback: (value: any, fallback?: T) => T, key: string, fallback?: T) {
  try {
    return callback(process.env[key], fallback);
  } catch (error) {
    console.warn(`Environment ${key}: ${error.message}`);
  }
  return undefined;
}

const staticConfig = {
  IMAGES_ROOTDIR: `${__dirname}/../public/images`,
  FONT_ROOTDIR: `${__dirname}/assets/fonts`,
};

// NODE_ENV environment variable (default "development") is used by :
// - jest : unit test (NODE_ENV == "test")

export const config = {
  ...staticConfig,
  ENVIRONMENT: _env(envStr, "ENVIRONMENT", "development"),
  RELEASE: _env(envStr, "RELEASE", "development"),
  PORT: _env(envInt, "PORT", 8080),
  RUN_CRONS: _env(envBool, "RUN_CRONS", false),
  RUN_TASKS: _env(envBool, "RUN_TASKS", false),
  ENABLE_SENTRY: _env(envBool, "ENABLE_SENTRY", false),
  ENABLE_SENDINBLUE: _env(envBool, "ENABLE_SENDINBLUE", false),
  MAIL_TRANSPORT: _env(envStr, "MAIL_TRANSPORT", null), // BREVO / SMTP / null (pas d'envoi d'email)
  SMTP_HOST: _env(envStr, "SMTP_HOST", "localhost"),
  SMTP_PORT: _env(envInt, "SMTP_PORT", 1025),
  ENABLE_ANTIVIRUS: _env(envBool, "ENABLE_ANTIVIRUS", false),
  ENABLE_FLATTEN_ERROR_LOGS: _env(envBool, "ENABLE_FLATTEN_ERROR_LOGS", false), // Print error stack without newlines on stderr
  API_URL: _env(envStr, "API_URL", "http://localhost:8080"),
  APP_URL: _env(envStr, "APP_URL", "http://localhost:8081"),
  ADMIN_URL: _env(envStr, "ADMIN_URL", "http://localhost:8082"),
  SENTRY_TRACING_SAMPLE_RATE: _env(envFloat, "SENTRY_TRACING_SAMPLE_RATE", 1),
  SENTRY_PROFILE_SAMPLE_RATE: _env(envFloat, "SENTRY_PROFILE_SAMPLE_RATE", 1),
  MONGO_URL: _env(envStr, "MONGO_URL", "mongodb://localhost:27017/local_app"),
  JWT_SECRET: _env(envStr, "JWT_SECRET", "my-secret"),
  SUPPORT_URL: _env(envStr, "SUPPORT_URL", "http://localhost:8083"),
  SUPPORT_APIKEY: _env(envStr, "SUPPORT_APIKEY"),
  KNOWLEDGEBASE_URL: _env(envStr, "KNOWLEDGEBASE_URL", "https://support.beta-snu.dev"),
  API_ANALYTICS_ENDPOINT: _env(envStr, "API_ANALYTICS_ENDPOINT", "http://localhost:8085"),
  API_ANALYTICS_API_KEY: _env(envStr, "API_ANALYTICS_API_KEY"),
  API_ANTIVIRUS_ENDPOINT: _env(envStr, "API_ANTIVIRUS_ENDPOINT", "http://localhost:8089"),
  ES_ENDPOINT: _env(envStr, "ES_ENDPOINT", "http://localhost:9200"),
  SENDINBLUEKEY: _env(envStr, "SENDINBLUEKEY"),
  DIAGORIENTE_URL: _env(envStr, "DIAGORIENTE_URL", "https://api-ql-dev.projetttv.org/graphql"),
  DIAGORIENTE_TOKEN: _env(envStr, "DIAGORIENTE_TOKEN"),
  FRANCE_CONNECT_URL: _env(envStr, "FRANCE_CONNECT_URL", "https://fcp.integ01.dev-franceconnect.fr/api/v1"),
  FRANCE_CONNECT_CLIENT_ID: _env(envStr, "FRANCE_CONNECT_CLIENT_ID"),
  FRANCE_CONNECT_CLIENT_SECRET: _env(envStr, "FRANCE_CONNECT_CLIENT_SECRET"),
  CELLAR_ENDPOINT: _env(envStr, "CELLAR_ENDPOINT"),
  CELLAR_KEYID: _env(envStr, "CELLAR_KEYID"),
  CELLAR_KEYSECRET: _env(envStr, "CELLAR_KEYSECRET"),
  BUCKET_NAME: _env(envStr, "BUCKET_NAME"),
  PUBLIC_BUCKET_NAME: _env(envStr, "PUBLIC_BUCKET_NAME"),
  CELLAR_ENDPOINT_SUPPORT: _env(envStr, "CELLAR_ENDPOINT_SUPPORT"),
  CELLAR_KEYID_SUPPORT: _env(envStr, "CELLAR_KEYID_SUPPORT"),
  CELLAR_KEYSECRET_SUPPORT: _env(envStr, "CELLAR_KEYSECRET_SUPPORT"),
  PUBLIC_BUCKET_NAME_SUPPORT: _env(envStr, "PUBLIC_BUCKET_NAME_SUPPORT"),
  FILE_ENCRYPTION_SECRET_SUPPORT: _env(envStr, "FILE_ENCRYPTION_SECRET_SUPPORT"),
  FILE_ENCRYPTION_SECRET: _env(envStr, "FILE_ENCRYPTION_SECRET"),
  QPV_USERNAME: _env(envStr, "QPV_USERNAME"),
  QPV_PASSWORD: _env(envStr, "QPV_PASSWORD"),
  API_ENGAGEMENT_URL: _env(envStr, "API_ENGAGEMENT_URL", "https://api.api-engagement.beta.gouv.fr"),
  API_ENGAGEMENT_KEY: _env(envStr, "API_ENGAGEMENT_KEY"),
  API_ASSOCIATION_CELLAR_ENDPOINT: _env(envStr, "API_ASSOCIATION_CELLAR_ENDPOINT"),
  API_ASSOCIATION_CELLAR_KEYID: _env(envStr, "API_ASSOCIATION_CELLAR_KEYID"),
  API_ASSOCIATION_CELLAR_KEYSECRET: _env(envStr, "API_ASSOCIATION_CELLAR_KEYSECRET"),
  SLACK_BOT_TOKEN: _env(envStr, "SLACK_BOT_TOKEN"),
  SLACK_BOT_CHANNEL: _env(envStr, "SLACK_BOT_CHANNEL"),
  JVA_TOKEN: _env(envStr, "JVA_TOKEN"),
  JVA_API_KEY: _env(envStr, "JVA_API_KEY"),
  REDIS_URL: _env(envStr, "REDIS_URL", "redis://127.0.0.1:6379"),
  API_DEMARCHE_SIMPLIFIEE_TOKEN: _env(envStr, "API_DEMARCHE_SIMPLIFIEE_TOKEN"),
  PM2_SLACK_URL: _env(envStr, "PM2_SLACK_URL"),
  API_ANTIVIRUS_KEY: _env(envStr, "API_ANTIVIRUS_KEY"),
  TASK_QUEUE_PREFIX: _env(envStr, "TASK_QUEUE_PREFIX", "dev"),
  TASK_MONITOR_ENABLE_AUTH: _env(envBool, "TASK_MONITOR_ENABLE_AUTH", false),
  TASK_MONITOR_USER: _env(envStr, "TASK_MONITOR_USER"),
  TASK_MONITOR_SECRET: _env(envStr, "TASK_MONITOR_SECRET"),
  ENABLE_2FA: _env(envBool, "ENABLE_2FA", false),
  LOG_LEVEL: _env(envStr, "LOG_LEVEL", "debug"), // error, warn, info, http, debug
  DO_MIGRATION: _env(envBool, "DO_MIGRATION", false),
  ENABLE_MONGOOSE_ELASTIC: _env(envBool, "ENABLE_MONGOOSE_ELASTIC", false),
};
