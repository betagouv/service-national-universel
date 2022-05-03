const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");
const { ES_ENDPOINT, LOG_ALL_ES_QUERIES } = require("../config");
const { cyrb53 } = require("../utils");

let esClient;

if (ES_ENDPOINT) {
  esClient = new Client({ node: `https://${ES_ENDPOINT}` });
  if (LOG_ALL_ES_QUERIES) {
    esClient.originalMsearch = esClient.msearch;
    esClient.msearch = async (...params) => {
      const { body, index } = params[0];
      const fileName = __dirname + `/../__tests__/es-snapshots/${index}-${cyrb53(body)}.ndjson`;
      const fileContent = body;
      const fileExists = fs.existsSync(fileName);
      if (!fileExists) {
        fs.writeFileSync(fileName, fileContent);
      }
      return esClient.originalMsearch(...params);
    };
  }
} else {
  console.log("Can't initialize ES. Missing envs");
}

module.exports = esClient;
