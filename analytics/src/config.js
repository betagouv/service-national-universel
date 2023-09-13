const ENVIRONMENT = process.env.DEV ? "development" : "production";
const PORT = process.env.PORT || 8085;
const POSTGRESQL = process.env.POSTGRESQL;
const SECRET_API_KEY = process.env.SECRET_API_KEY || "api-key";
const JWT_SECRET = process.env.JWT_SECRET || "not-so-secret";
const JDMA_LOGIN = process.env.JDMA_LOGIN;
const JDMA_PASSWORD = process.env.JDMA_PASSWORD;

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || "";
const SLACK_BOT_CHANNEL = process.env.SLACK_BOT_CHANNEL || "";

const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || 1;

module.exports = {
  PORT,
  POSTGRESQL,
  ENVIRONMENT,
  SECRET_API_KEY,
  JWT_SECRET,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
  JDMA_LOGIN,
  JDMA_PASSWORD,
  SLACK_BOT_CHANNEL,
  SLACK_BOT_TOKEN,
};
