const { Secret, createClient } = require("@scaleway/sdk");

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
      const secret = await api.accessSecretVersionByName({ secretName, revision: "latest_enabled" });
      const decodedData = Buffer.from(secret.data, "base64").toString("utf8");
      secrets = JSON.parse(decodedData);
    }

    return secrets[key]
  }
}

module.exports = { getSecret };
