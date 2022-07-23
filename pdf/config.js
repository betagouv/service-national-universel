const ENVIRONMENT = getEnvironment();
const PORT = process.env.PORT || 3000;

const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || "";

module.exports = {
  PORT,
  ENVIRONMENT,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
};

function getEnvironment() {
  if (process.env.STAGING === "true") return "staging";
  else if (process.env.PRODUCTION === "true") return "production";
  else if (process.env.TESTING === "true" || process.env.NODE_ENV === "test")
    return "testing";
  return "development";
}
