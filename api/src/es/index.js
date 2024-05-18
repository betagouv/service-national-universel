const { Client } = require("@elastic/elasticsearch");

const config = require("config");

let esClient;

if (config.ES_ENDPOINT) {
  // TODO : REMOVE these 2 lines when all ES_ENDPOINT secret will be updated with the protocol
  const has_protocol = config.ES_ENDPOINT.startsWith("http://") || config.ES_ENDPOINT.startsWith("https://");
  const endpoint = has_protocol ? config.ES_ENDPOINT : `https://${config.ES_ENDPOINT}`;

  esClient = new Client({ node: endpoint });
} else {
  console.log("Can't initialize ES. Missing envs");
}

module.exports = esClient;
