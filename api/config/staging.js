const { getSecrets, PROD_PROJECT_ID } = require("../src/secrets-manager");

const secretKey = process.env.SCW_SECRET_KEY;

if (!secretKey) {
  throw new Error("SCW_SECRET_KEY is required to get configuration secrets");
}

const REVISION = 9;
const secrets = getSecrets(secretKey, PROD_PROJECT_ID, "snu-staging", REVISION);

module.exports = {
  ENVIRONMENT: "staging",
  RELEASE: process.env.RELEASE,
  API_URL: "https://api.beta-snu.dev",
  APP_URL: "https://moncompte.beta-snu.dev",
  ADMIN_URL: "https://admin.beta-snu.dev",
  SENTRY_PROFILE_SAMPLE_RATE: 0.8,
  SENTRY_TRACING_SAMPLE_RATE: 0.1,
  ...secrets,
  secret: secrets["SECRET"],
};
