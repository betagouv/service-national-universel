const ES_NO_LIMIT = 10000;

function searchSubQuery([value], fields) {
  return {
    bool: {
      should: [
        { multi_match: { query: value, fields, type: "cross_fields", operator: "and" } },
        { multi_match: { query: value, fields, type: "phrase", operator: "and" } },
        { multi_match: { query: value, fields, type: "phrase_prefix", operator: "and" } },
      ],
      minimum_should_match: 1,
    },
  };
}

function hitsSubQuery(query, key, value) {
  if (value.includes("N/A")) {
    query.bool.filter.push({ bool: { should: [{ bool: { must_not: { exists: { field: key } } } }, { terms: { [key]: value.filter((e) => e !== "N/A") } }] } });
  } else {
    query.bool.must.push({ terms: { [key]: value } });
  }
  return query;
}

function aggsSubQuery(keys, aggsSearchQuery, queryFilters, contextFilters) {
  let aggs = {};
  console.log(keys, queryFilters);
  for (const key of keys) {
    let filter = { bool: { must: [], filter: contextFilters } };
    if (aggsSearchQuery) filter.bool.must.push(aggsSearchQuery);

    for (const subKey of keys) {
      if (subKey === key) continue;
      if (!queryFilters[subKey.replace(".keyword", "")]?.length) continue;
      console.log("youpi");
      filter = hitsSubQuery(filter, subKey, queryFilters[subKey.replace(".keyword", "")]);
    }

    if (key.includes(".keyword")) {
      aggs[key.replace(".keyword", "")] = { filter, aggs: { names: { terms: { field: key, missing: "N/A", size: ES_NO_LIMIT } } } };
    } else {
      aggs[key] = { filter, aggs: { names: { histogram: { field: key, interval: 1, min_doc_count: 1 } } } };
    }
  }
  console.log(JSON.stringify(aggs));
  return aggs;
}

function buildSort(sort) {
  if (!sort) return [{ createdAt: { order: "desc" } }];
  return [{ [sort.field.includes(".keyword") ? sort.field : sort.field + ".keyword"]: { order: sort.order } }];
}

function buildNdJson(header, hitsQuery, aggsQuery) {
  return [JSON.stringify(header), JSON.stringify(hitsQuery), JSON.stringify(header), JSON.stringify(aggsQuery)].join("\n") + "\n";
}

function buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters }) {
  // We always need a fresh query to avoid side effects.
  const getMainQuery = () => ({ bool: { must: [{ match_all: {} }], filter: contextFilters } });
  // Search query
  const search = (queryFilters.searchbar || []).filter((e) => e.trim()).length ? searchSubQuery(queryFilters.searchbar, searchFields) : null;
  // Hits request body
  const hitsRequestBody = { query: getMainQuery(), size: 20, from: page * 20, sort: buildSort(sort), track_total_hits: true };
  if (search) hitsRequestBody.query.bool.must.push(search);
  for (const key of filterFields) {
    const keyWithoutKeyword = key.replace(".keyword", "");
    if (!queryFilters[keyWithoutKeyword]?.length) continue;
    hitsRequestBody.query = hitsSubQuery(hitsRequestBody.query, key, queryFilters[keyWithoutKeyword]);
  }
  // Aggs request body
  const aggsRequestBody = { query: getMainQuery(), aggs: aggsSubQuery(filterFields, search, queryFilters, contextFilters), size: 0, track_total_hits: true };
  return { hitsRequestBody, aggsRequestBody };
}

module.exports = {
  buildNdJson,
  buildRequestBody,
};
