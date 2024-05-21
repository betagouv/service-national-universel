// Copy to local-development.js & Edit local configuration

const asyncSecretConfig = require("../secrets-manager");

module.exports = {
    SECRET_NAME: "snu-ci",
    ...asyncSecretConfig(),
    ENABLE_SENDINBLUE: false,
}
