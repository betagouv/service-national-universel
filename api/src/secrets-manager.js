const { Secret, createClient } = require("@scaleway/sdk");
const asyncConfig = require('config/async').asyncConfig;

let secrets = null;

function getSecret(key) {

  return async (config, original) => {
    if (secrets === null) {
      const client = createClient({
        accessKey: config.SCW_ACCESS_KEY,
        secretKey: config.SCW_SECRET_KEY,
        defaultRegion: "fr-par",
        defaultZone: "fr-par-1",
      });

      const api = new Secret.v1alpha1.API(client);

      const secretName = config.SECRET_NAME;
      const revision = config.SECRET_REVISION;
      const secret = await api.accessSecretVersionByName({ secretName, revision });
      const decodedData = Buffer.from(secret.data, "base64").toString("utf8");
      secrets = JSON.parse(decodedData);
    }

    return secrets[key]
  }
}

function asyncSecretConfig() {
  return {
    MONGO_URL: asyncConfig(getSecret("MONGO_URL")),
    secret: asyncConfig(getSecret("SECRET")),
    SUPPORT_URL: asyncConfig(getSecret("SUPPORT_URL")),
    SUPPORT_APIKEY: asyncConfig(getSecret("SUPPORT_APIKEY")),
    KNOWLEDGEBASE_URL: asyncConfig(getSecret("KNOWLEDGEBASE_URL")),
    API_ANALYTICS_ENDPOINT: asyncConfig(getSecret("API_ANALYTICS_ENDPOINT")),
    API_ANALYTICS_API_KEY: asyncConfig(getSecret("API_ANALYTICS_API_KEY")),
    API_ANTIVIRUS_ENDPOINT: asyncConfig(getSecret("API_ANTIVIRUS_ENDPOINT")),
    API_ANTIVIRUS_TOKEN: asyncConfig(getSecret("API_ANTIVIRUS_TOKEN")),
    ES_ENDPOINT: asyncConfig(getSecret("ES_ENDPOINT")),
    SENDINBLUEKEY: asyncConfig(getSecret("SENDINBLUEKEY")),
    SENTRY_URL: asyncConfig(getSecret("SENTRY_URL")),
    DIAGORIENTE_URL: asyncConfig(getSecret("DIAGORIENTE_URL")),
    DIAGORIENTE_TOKEN: asyncConfig(getSecret("DIAGORIENTE_TOKEN")),
    FRANCE_CONNECT_URL: asyncConfig(getSecret("FRANCE_CONNECT_URL")),
    FRANCE_CONNECT_CLIENT_ID: asyncConfig(getSecret("FRANCE_CONNECT_CLIENT_ID")),
    FRANCE_CONNECT_CLIENT_SECRET: asyncConfig(getSecret("FRANCE_CONNECT_CLIENT_SECRET")),
    CELLAR_ENDPOINT: asyncConfig(getSecret("CELLAR_ENDPOINT")),
    CELLAR_KEYID: asyncConfig(getSecret("CELLAR_KEYID")),
    CELLAR_KEYSECRET: asyncConfig(getSecret("CELLAR_KEYSECRET")),
    BUCKET_NAME: asyncConfig(getSecret("BUCKET_NAME")),
    PUBLIC_BUCKET_NAME: asyncConfig(getSecret("PUBLIC_BUCKET_NAME")),
    CELLAR_ENDPOINT_SUPPORT: asyncConfig(getSecret("CELLAR_ENDPOINT_SUPPORT")),
    CELLAR_KEYID_SUPPORT: asyncConfig(getSecret("CELLAR_KEYID_SUPPORT")),
    CELLAR_KEYSECRET_SUPPORT: asyncConfig(getSecret("CELLAR_KEYSECRET_SUPPORT")),
    PUBLIC_BUCKET_NAME_SUPPORT: asyncConfig(getSecret("PUBLIC_BUCKET_NAME_SUPPORT")),
    FILE_ENCRYPTION_SECRET_SUPPORT: asyncConfig(getSecret("FILE_ENCRYPTION_SECRET_SUPPORT")),
    FILE_ENCRYPTION_SECRET: asyncConfig(getSecret("FILE_ENCRYPTION_SECRET")),
    QPV_USERNAME: asyncConfig(getSecret("QPV_USERNAME")),
    QPV_PASSWORD: asyncConfig(getSecret("QPV_PASSWORD")),
    API_ENGAGEMENT_URL: asyncConfig(getSecret("API_ENGAGEMENT_URL")),
    API_ENGAGEMENT_KEY: asyncConfig(getSecret("API_ENGAGEMENT_KEY")),
    API_ASSOCIATION_ES_ENDPOINT: asyncConfig(getSecret("API_ASSOCIATION_ES_ENDPOINT")),
    API_ASSOCIATION_CELLAR_ENDPOINT: asyncConfig(getSecret("API_ASSOCIATION_CELLAR_ENDPOINT")),
    API_ASSOCIATION_CELLAR_KEYID: asyncConfig(getSecret("API_ASSOCIATION_CELLAR_KEYID")),
    API_ASSOCIATION_CELLAR_KEYSECRET: asyncConfig(getSecret("API_ASSOCIATION_CELLAR_KEYSECRET")),
    SLACK_BOT_TOKEN: asyncConfig(getSecret("SLACK_BOT_TOKEN")),
    SLACK_BOT_CHANNEL: asyncConfig(getSecret("SLACK_BOT_CHANNEL")),
    JVA_TOKEN: asyncConfig(getSecret("JVA_TOKEN")),
    JVA_API_KEY: asyncConfig(getSecret("JVA_API_KEY")),
    REDIS_URL: asyncConfig(getSecret("REDIS_URL")),
  }
}

module.exports = asyncSecretConfig;
