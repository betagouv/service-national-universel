const PORT = process.env.PORT || 8088;

const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || "";

const LOCAL = process.env.LOCAL || "";
const MONGO_URL = process.env.MONGO_URL || "";

module.exports = {
  PORT,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
  LOCAL,
  MONGO_URL,
};
