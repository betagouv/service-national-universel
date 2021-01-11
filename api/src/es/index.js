const { ES_ENDPOINT } = require("../config");
const { Client } = require("@elastic/elasticsearch");
const es = new Client({ node: `https://${ES_ENDPOINT}` });

const getElasticInstance = () => es;
module.exports = getElasticInstance;
