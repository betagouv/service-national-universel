module.exports = {
  ENVIRONMENT: process.env.DEV ? "development" : "production",
  PORT: process.env.PORT || 8085,
  POSTGRESQL: process.env.POSTGRESQL,
  REDIS_URL: process.env.REDIS_URL,
  SECRET_API_KEY: process.env.SECRET_API_KEY || "api-key",
  JWT_SECRET: process.env.JWT_SECRET || "not-so-secret",
  JDMA_LOGIN: process.env.JDMA_LOGIN,
  JDMA_PASSWORD: process.env.JDMA_PASSWORD,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || "",
  SLACK_BOT_CHANNEL: process.env.SLACK_BOT_CHANNEL || "",
  SENTRY_URL: process.env.SENTRY_URL || "",
  SENTRY_TRACING_SAMPLE_RATE: process.env.SENTRY_TRACING_SAMPLE_RATE || 1,
};
