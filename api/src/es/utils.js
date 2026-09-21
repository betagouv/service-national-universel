const { getEsSensitiveFields } = require("snu-lib");

const esClient = require("../es");

// Variables should be renamed to avoid confusion.
async function* scrollSearch(params, client) {
  let response = await client.search(params);
  let scrollId = response.body._scroll_id; // Capture the initial scroll ID

  try {
    while (true) {
      const sourceHits = response.body.hits.hits;

      if (sourceHits.length === 0) {
        break;
      }

      for (const hit of sourceHits) {
        yield hit;
      }

      response = await client.scroll({
        scrollId,
        scroll: params.scroll,
      });

      scrollId = response.body._scroll_id; // Update the scroll ID if needed
    }
  } finally {
    // Ensure the scroll context is closed even if there's an error
    if (scrollId) {
      await client.clearScroll({ scrollId: scrollId });
    }
  }
}

// Can get more than 10k results.
// The es param is given to scroll function
async function allRecords(index, query, client = esClient, fieldsToExport = "*") {
  const params = {
    index,
    scroll: "1m",
    size: 1000,
    // Les champs secrets sont exclus côté cluster : un `fieldsToExport` piloté par
    // le client ne peut pas les faire ressortir.
    body: { query, _source: buildSourceFilter(index, fieldsToExport) },
  };

  const result = [];

  for await (const hit of scrollSearch(params, client)) {
    result.push({ _id: hit._id, ...hit._source });
  }
  return result;
}

/**
 * Construit le filtre `_source` d'une requête ES : les champs demandés par
 * l'appelant en inclusion, les champs secrets de l'index en exclusion.
 */
function buildSourceFilter(index, fieldsToExport = "*") {
  const excludes = getEsSensitiveFields(index);
  const includes = !fieldsToExport || fieldsToExport === "*" ? ["*"] : [].concat(fieldsToExport);
  if (!excludes.length) return includes;
  return { includes, excludes };
}

module.exports = {
  allRecords,
  buildSourceFilter,
};
