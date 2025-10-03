const PORT = process.env.PORT || 8088;

const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || "";
const SENTRY_DEBUG_MODE = process.env.SENTRY_DEBUG_MODE === "true";

const LOCAL = process.env.LOCAL || "";
const MONGO_URL = process.env.MONGO_URL || "";

module.exports = {
  PORT,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
  SENTRY_DEBUG_MODE,
  LOCAL,
  MONGO_URL,
};
