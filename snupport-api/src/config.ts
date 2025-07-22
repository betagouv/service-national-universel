import dotenv from "dotenv";

// TODO : replace with snu-lib functions
function envStr(value: any, fallback?: string) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error("undefined value");
    } else {
      return fallback;
    }
  }
  return value;
}

function envInt(value: any, fallback?: number) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error("undefined value");
    } else {
      return fallback;
    }
  }
  const intValue = parseInt(value);
  if (isNaN(intValue)) {
    throw new Error("invalid integer value");
  }
  return intValue;
}

function envBool(value: any, fallback?: boolean) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error("undefined value");
    } else {
      return fallback;
    }
  }
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  }
  throw new Error("invalid boolean value");
}
// END

function _env<T>(callback: (value: any, fallback?: T) => T, key: string, fallback?: T) {
  try {
    return callback(process.env[key], fallback);
  } catch (error) {
    console.warn(`Environment ${key}: ${error.message}`);
  }
  return undefined;
}

// NODE_ENV environment variable is used by :
// - jest : unit test (NODE_ENV == "test")
const defaultEnv = process.env.NODE_ENV === "test" ? "test" : "development";
const environment = _env(envStr, "ENVIRONMENT", defaultEnv);

if (environment == "development") {
  dotenv.config();
}

export const config = {
  ENVIRONMENT: environment,
  RELEASE: _env(envStr, "RELEASE", "development"),
  ENABLE_SENTRY: _env(envBool, "ENABLE_SENTRY", environment !== "development"),
  ENABLE_SLACK: _env(envBool, "ENABLE_SLACK", environment === "production"),
  PORT: _env(envInt, "PORT", 8090),
  MONGO_URL: _env(envStr, "MONGO_URL", "mongodb://localhost:27017/snu_dev?directConnection=true"),
  JWT_SECRET: _env(envStr, "JWT_SECRET", "my-secret"),
  SNU_URL_APP: _env(envStr, "SNU_URL_APP", "http://localhost:8081"),
  SNU_URL_ADMIN: _env(envStr, "SNU_URL_ADMIN", "http://localhost:8082"),
  SNUPPORT_URL_ADMIN: _env(envStr, "SNUPPORT_URL_ADMIN", "http://localhost:8092"),
  SNUPPORT_URL_KB: _env(envStr, "SNUPPORT_URL_KB", "http://localhost:8091"),
  CELLAR_ENDPOINT: _env(envStr, "CELLAR_ENDPOINT"),
  CELLAR_KEYID: _env(envStr, "CELLAR_KEYID"),
  CELLAR_KEYSECRET: _env(envStr, "CELLAR_KEYSECRET"),
  PUBLIC_BUCKET_NAME: _env(envStr, "PUBLIC_BUCKET_NAME"),
  CELLAR_ENDPOINT_SUPPORT: _env(envStr, "CELLAR_ENDPOINT_SUPPORT"),
  CELLAR_KEYID_SUPPORT: _env(envStr, "CELLAR_KEYID_SUPPORT"),
  CELLAR_KEYSECRET_SUPPORT: _env(envStr, "CELLAR_KEYSECRET_SUPPORT"),
  PUBLIC_BUCKET_NAME_SUPPORT: _env(envStr, "PUBLIC_BUCKET_NAME_SUPPORT"),
  FILE_ENCRYPTION_SECRET: _env(envStr, "FILE_ENCRYPTION_SECRET"),
  SLACK_BOT_CHANNEL: _env(envStr, "SLACK_BOT_CHANNEL"),
  SLACK_BOT_TOKEN: _env(envStr, "SLACK_BOT_TOKEN"),
  REVALIDATION_TOKEN: _env(envStr, "REVALIDATION_TOKEN"),
  MAIL_TRANSPORT: _env(envStr, "MAIL_TRANSPORT", null), // BREVO / SMTP / null (pas d'envoi d'email)
  SMTP_HOST: _env(envStr, "SMTP_HOST", "localhost"),
  SMTP_PORT: _env(envInt, "SMTP_PORT", 1025),
  ENABLE_SENDINBLUE: _env(envBool, "ENABLE_SENDINBLUE", false),
  LOG_LEVEL: _env(envStr, "LOG_LEVEL", "debug"), // error, warn, info, http, debug
  SENDINBLUEKEY: _env(envStr, "SENDINBLUEKEY"),
};
