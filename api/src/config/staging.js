const asyncSecretConfig = require("../secrets-manager");

module.exports = {
    ENVIRONMENT: "staging",
    SECRET_NAME: "snu-staging",
    RELEASE: process.env.RELEASE,
    API_URL: "https://api.beta-snu.dev",
    APP_URL: "https://moncompte.beta-snu.dev",
    ADMIN_URL: "https://admin.beta-snu.dev",
    ...asyncSecretConfig(),
}
