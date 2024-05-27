const asyncSecretConfig = require("../src/secrets-manager");

module.exports = {
  ENVIRONMENT: "ci",
  SECRET_NAME: "snu-ci",
  SECRET_REVISION: "13",
  RELEASE: process.env.RELEASE,
  API_URL: "https://api.ci.beta-snu.dev",
  APP_URL: "https://moncompte.ci.beta-snu.dev",
  ADMIN_URL: "https://admin.ci.beta-snu.dev",
  ...asyncSecretConfig(),
};
