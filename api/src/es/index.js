const { Client } = require("@elastic/elasticsearch");

const config = require("config");

let _client = null;

function initESClient() {
  if (config.ES_ENDPOINT) {
    _client = new Client({ node: config.ES_ENDPOINT });
  } else {
    console.error("Can't initialize ES. Missing envs");
  }
}

function esClient() {
  return _client;
}

module.exports = {
  initESClient,
  esClient,
};
