const { Client } = require("@elastic/elasticsearch");

const { ES_ENDPOINT } = require("../config");

let esClient;

if (ES_ENDPOINT) {
  esClient = new Client({ node: `https://${ES_ENDPOINT}` });
} else {
  console.log("Can't initialize ES. Missing envs");
}

module.exports = esClient;
