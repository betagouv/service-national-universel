const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { Secret, createClient } = require("@scaleway/sdk");

async function loadEnv() {
  if (!process.env.DEV) return;

  const client = createClient({
    accessKey: process.env.SCW_ACCESS_KEY,
    secretKey: process.env.SCW_SECRET_KEY,
    defaultProjectId: process.env.SCW_DEFAULT_PROJECT_ID,
    defaultRegion: "fr-par",
    defaultZone: "fr-par-1",
  });

  const api = new Secret.v1alpha1.API(client);

  const secret = await api.accessSecretVersionByName({ secretName: "api-prod", revision: "latest_enabled" });
  const decodedData = Buffer.from(secret.data, "base64").toString("utf8");
  const parsed = require("dotenv").parse(decodedData);

  for (const key in parsed) {
    process.env[key] = parsed[key];
  }
}

module.exports = loadEnv;
