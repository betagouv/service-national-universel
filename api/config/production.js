const asyncSecretConfig = require("../secrets-manager");

module.exports = {
    ENVIRONMENT: "production",
    SECRET_NAME: "snu-production",
    SECRET_REVISION: "16",
    RELEASE: process.env.RELEASE,
    API_URL: "https://api.snu.gouv.fr",
    APP_URL: "https://moncompte.snu.gouv.fr",
    ADMIN_URL: "https://admin.snu.gouv.fr",
    SENTRY_PROFILE_SAMPLE_RATE: 0.2,
    SENTRY_TRACING_SAMPLE_RATE: 0.01,
    ...asyncSecretConfig(),
}
