const { Client } = require("@elastic/elasticsearch");

const { ES_ENDPOINT } = require("../config");

let esClient;

if (ES_ENDPOINT) {
  // TODO : REMOVE these 2 lines when all ES_ENDPOINT secret will be updated with the protocol
  const has_protocol = ES_ENDPOINT.startsWith("http://") || ES_ENDPOINT.startsWith("https://");
  const endpoint = has_protocol ? ES_ENDPOINT : `https://${ES_ENDPOINT}`;

  esClient = new Client({ node: endpoint });
} else {
  console.log("Can't initialize ES. Missing envs");
}

module.exports = esClient;
