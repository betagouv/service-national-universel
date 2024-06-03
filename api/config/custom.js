const { getSecrets, CI_PROJECT_ID } = require("../src/secrets-manager");

const secretKey = process.env.SCW_SECRET_KEY;
const secretName = process.env.SECRET_NAME;

if (!secretKey || !secretName) {
  throw new Error("SCW_SECRET_KEY & SECRET_NAME are required to get configuration secrets");
}

const secrets = getSecrets(secretKey, CI_PROJECT_ID, secretName);

module.exports = {
  ENVIRONMENT: "custom",
  RELEASE: process.env.RELEASE,
  API_URL: process.env.API_URL,
  APP_URL: process.env.APP_URL,
  ADMIN_URL: process.env.ADMIN_URL,
  ...secrets,
  secret: secrets["SECRET"],
};
