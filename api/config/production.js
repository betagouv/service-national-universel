const { getSecrets, PROD_PROJECT_ID } = require("../src/secrets-manager");

const secretKey = process.env.SCW_SECRET_KEY;

if (!secretKey) {
  throw new Error("SCW_SECRET_KEY is required to get configuration secrets");
}

const REVISION = 24;
const secrets = getSecrets(secretKey, PROD_PROJECT_ID, "snu-production", REVISION);

module.exports = {
  ENVIRONMENT: "production",
  RUN_CRONS: true,
  API_URL: "https://api.snu.gouv.fr",
  APP_URL: "https://moncompte.snu.gouv.fr",
  ADMIN_URL: "https://admin.snu.gouv.fr",
  SENTRY_PROFILE_SAMPLE_RATE: 0.2,
  SENTRY_TRACING_SAMPLE_RATE: 0.01,
  TASK_QUEUE_PREFIX: "production",
  MAIL_TRANSPORT: "BREVO",
  ENABLE_2FA: true,
  ...secrets,
};
