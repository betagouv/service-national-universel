const PORT = process.env.PORT || 8087;

const API_URL = process.env.API_URL || "http://localhost:8080";
const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || "";

const LOCAL = process.env.LOCAL || "";
const GENERATE_LOCALLY = (LOCAL && process.env.GENERATE_LOCALLY) || "";

module.exports = {
  PORT,
  API_URL,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
  GENERATE_LOCALLY,
  LOCAL,
};
