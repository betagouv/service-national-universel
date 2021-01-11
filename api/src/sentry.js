const Sentry = require("@sentry/node");
const { ENVIRONMENT, SENTRY_URL } = require("./config");

if (ENVIRONMENT === "production") {
  Sentry.init({
    dsn: SENTRY_URL,
    environment: "server",
  });
}

function capture(err) {
  console.log("capture", err);
  if (Sentry && err) {
    Sentry.captureException(err);
  }
}

module.exports = {
  capture,
};
