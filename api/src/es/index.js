const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");
const { ES_ENDPOINT } = require("../config");

let esClient;

const cyrb53 = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

if (ES_ENDPOINT) {
  esClient = new Client({ node: `https://${ES_ENDPOINT}` });
  esClient.originalMsearch = esClient.msearch;
  esClient.msearch = async (...params) => {
    // Print each query in a file in ../__tests__/fixtures.*.ndjson. First we check if file with the same content exists.
    // If not, we create it.
    const { body, index } = params[0];
    const fileName = __dirname + `/../__tests__/fixtures/es/${index}-${cyrb53(body)}.ndjson`;
    const fileContent = body;
    /*
    const fileExists = fs.existsSync(fileName);
    if (!fileExists) {
      fs.writeFileSync(fileName, fileContent);
    }
    */
    return esClient.originalMsearch(...params);
  };
} else {
  console.log("Can't initialize ES. Missing envs");
}

module.exports = esClient;
