// ! Copy to local-development.js & Edit local configuration

const asyncSecretConfig = require("../src/secrets-manager");

module.exports = {
  SECRET_NAME: "snu-ci",
  ...asyncSecretConfig(),
  ENABLE_SENDINBLUE: false,
};
