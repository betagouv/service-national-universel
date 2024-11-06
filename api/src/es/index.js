const { Client } = require("@elastic/elasticsearch");
const { logger } = require("../logger");

const config = require("config");

let esClient;

if (config.ES_ENDPOINT) {
  esClient = new Client({ node: config.ES_ENDPOINT });
} else {
  logger.info("Can't initialize ES. Missing envs");
}

module.exports = esClient;
