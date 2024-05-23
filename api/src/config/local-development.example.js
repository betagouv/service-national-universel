// ! Copy to local-development.js & Edit local configuration
// * Add SCW_ACCESS_KEY and SCW_SECRET_KEY at the beginning

const asyncSecretConfig = require("../secrets-manager");

module.exports = {
  SECRET_NAME: "snu-ci",
  ...asyncSecretConfig(),
  ENABLE_SENDINBLUE: false,
};
