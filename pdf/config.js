const PORT = process.env.PORT || 8087;

const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || "";

const GENERATE_LOCALLY = process.env.GENERATE_LOCALLY || "";

module.exports = {
  PORT,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
};
