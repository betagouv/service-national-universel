const esClient = require("../es");

async function* scrollSearch(params) {
  let response = await esClient.search(params);

  while (true) {
    const sourceHits = response.body.hits.hits;

    if (sourceHits.length === 0) {
      break;
    }

    for (const hit of sourceHits) {
      yield hit;
    }

    if (!response.body._scroll_id) {
      break;
    }

    response = await esClient.scroll({
      scrollId: response.body._scroll_id,
      scroll: params.scroll,
    });
  }
}

// Can get more than 10k results.
async function allRecords(index, query) {
  const params = {
    index,
    scroll: "1m",
    size: 1000,
    body: { query },
  };

  const result = [];

  for await (const hit of scrollSearch(params)) {
    result.push({ _id: hit._id, ...hit._source });
  }
  return result;
}

module.exports = {
  allRecords,
};
