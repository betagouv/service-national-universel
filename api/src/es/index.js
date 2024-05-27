const { Client } = require("@elastic/elasticsearch");

const config = require("config");

let esClient;

if (config.ES_ENDPOINT) {
  esClient = new Client({ node: config.ES_ENDPOINT });
} else {
  console.log("Can't initialize ES. Missing envs");
}

module.exports = esClient;
