const PORT = process.env.PORT || 8089;
const RELEASE = process.env.RELEASE || "local";

const SENTRY_URL = process.env.SENTRY_URL || "";
const SENTRY_TRACING_SAMPLE_RATE = process.env.SENTRY_TRACING_SAMPLE_RATE || "";

const CLAMSCAN_CONFIG = {
  removeInfected: true,
  clamdscan: {
    host: "127.0.0.1",
    port: 3310,
    timeout: 30000,
    socket: null,
  },
};

module.exports = {
  PORT,
  RELEASE,
  SENTRY_URL,
  SENTRY_TRACING_SAMPLE_RATE,
  CLAMSCAN_CONFIG,
};
