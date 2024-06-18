const { getSecrets, CI_PROJECT_ID } = require("../src/secrets-manager");

const secretKey = process.env.SCW_SECRET_KEY;
const secretName = process.env.SECRET_NAME;

if (!secretKey || !secretName) {
  throw new Error("SCW_SECRET_KEY & SECRET_NAME are required to get configuration secrets");
}

const secrets = getSecrets(secretKey, CI_PROJECT_ID, secretName);

module.exports = {
  ENVIRONMENT: "custom",
  ...secrets,
};
