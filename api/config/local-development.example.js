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
};
