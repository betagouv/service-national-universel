const asyncSecretConfig = require("../secrets-manager");

module.exports = {
    ENVIRONMENT: "custom",
    SECRET_NAME: process.env.SECRET_NAME,
    RELEASE: process.env.RELEASE,
    API_URL: process.env.API_URL,
    APP_URL: process.env.APP_URL,
    ADMIN_URL: process.env.ADMIN_URL,
    ...asyncSecretConfig(),
}
