const request = require("sync-request-curl");

const REGION = "fr-par";
const PROD_PROJECT_ID = "a0c93450-f68c-4768-8fe8-6e07a1644530"; // snu-production
const CI_PROJECT_ID = "1b29c5d9-9723-400a-aa8b-0c85ae3567f7"; //snu-ci

function getSecrets(secretKey, projectId, secretName, revision="latest_enabled") {

  const url = `https://api.scaleway.com/secret-manager/v1beta1/regions/${REGION}/secrets-by-path/versions/${revision}/access?project_id=${projectId}&secret_name=${secretName}`;
  const headers = {
    "X-Auth-Token": secretKey,
  };

  const response = request('GET', url, {headers});

  const body = response.body.toString();

  const jsonBody = JSON.parse(body);

  const decodedData = Buffer.from(jsonBody.data, "base64").toString("utf8");

  return JSON.parse(decodedData);
}

module.exports = {
  getSecrets,
  PROD_PROJECT_ID,
  CI_PROJECT_ID,
};
