const { getSecrets, CI_PROJECT_ID } = require("../src/secrets-manager");

const secretKey = process.env.SCW_SECRET_KEY;

if (!secretKey) {
  throw new Error("SCW_SECRET_KEY is required to get configuration secrets");
}

const REVISION = 8;
const secrets = getSecrets(secretKey, CI_PROJECT_ID, "snu-ci", REVISION);

module.exports = {
  ENVIRONMENT: "ci",
  API_URL: "https://api.ci.beta-snu.dev",
  APP_URL: "https://moncompte.ci.beta-snu.dev",
  ADMIN_URL: "https://admin.ci.beta-snu.dev",
  TASK_QUEUE_PREFIX: "ci",
  MAIL_TRANSPORT: "SMTP",
  LOG_LEVEL: "debug",
  ...secrets,
};
