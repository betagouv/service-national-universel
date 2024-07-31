// ! Copy to local-development.js & Edit local configuration
const { getSecrets, CI_PROJECT_ID, PROD_PROJECT_ID } = require("../src/secrets-manager");

const secretKey = process.env.SCW_SECRET_KEY;

if (!secretKey) {
  throw new Error("SCW_SECRET_KEY is required to get configuration secrets");
}

const secrets = getSecrets(secretKey, CI_PROJECT_ID, "snu-ci");
// const secrets = getSecrets(secretKey, PROD_PROJECT_ID, "snu-production");

module.exports = {
  ENABLE_SENDINBLUE: false,
  ...secrets,
  // MAIL_TRANSPORT: "STMP", // BREVO / SMTP
  // SMTP_HOST: "localhost",
  // SMTP_PORT: 1025,
  // REDIS_URL: "redis://127.0.0.1:6379",
  // MAILCATCHER_HOST: "localhost",
  // MAILCATCHER_PORT: 1025,
};
