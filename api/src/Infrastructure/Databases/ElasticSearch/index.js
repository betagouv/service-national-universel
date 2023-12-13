const { Client } = require("@elastic/elasticsearch");

const { ES_ENDPOINT, LOCAL } = require("../../Config/config");

let esClient;
const ES_ADDRESS = LOCAL ? ES_ENDPOINT : `https://${ES_ENDPOINT}`;

if (ES_ENDPOINT) {
  esClient = new Client({ node: ES_ADDRESS });
} else {
  console.log("Can't initialize ES. Missing envs");
}

module.exports = esClient;
