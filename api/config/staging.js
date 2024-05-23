const asyncSecretConfig = require("../secrets-manager");

module.exports = {
  ENVIRONMENT: "staging",
  SECRET_NAME: "snu-staging",
  SECRET_REVISION: "8",
  RELEASE: process.env.RELEASE,
  API_URL: "https://api.beta-snu.dev",
  APP_URL: "https://moncompte.beta-snu.dev",
  ADMIN_URL: "https://admin.beta-snu.dev",
  SENTRY_PROFILE_SAMPLE_RATE: 0.8,
  SENTRY_TRACING_SAMPLE_RATE: 0.1,
  ...asyncSecretConfig(),
};
