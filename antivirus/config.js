const PORT = process.env.PORT || 8089;
const RELEASE = process.env.RELEASE || "local";

const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || "";

const CLAMSCAN_CONFIG = {
  removeInfected: true,
  clamdscan: {
    timeout: 30000,
    socket: "/run/clamav/clamd.sock",
  },
};

module.exports = {
  PORT,
  RELEASE,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
  CLAMSCAN_CONFIG,
};
