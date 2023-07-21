const Joi = require("joi");
const { capture } = require("../../sentry");

const ES_NO_LIMIT = 10000;

function searchSubQuery([value], fields) {
  return {
    bool: {
      should: [
        { multi_match: { query: value, fields, type: "cross_fields", operator: "and" } },
        { multi_match: { query: value, fields, type: "phrase", operator: "and" } },
        { multi_match: { query: value, fields: fields.map((e) => e.replace(".keyword", "")), type: "phrase_prefix", operator: "and" } },
      ],
      minimum_should_match: 1,
    },
  };
}

function hitsSubQuery(query, key, value, customQueries) {
  const keyWithoutKeyword = key.replace(".keyword", "");
  if (customQueries?.[keyWithoutKeyword]) {
    query = customQueries[keyWithoutKeyword](query, value);
  } else if (value.includes("N/A")) {
    query.bool.filter.push({ bool: { should: [{ bool: { must_not: { exists: { field: key } } } }, { terms: { [key]: value.filter((e) => e !== "N/A") } }] } });
  } else {
    query.bool.must.push({ terms: { [key]: value } });
  }
  return query;
}

function aggsSubQuery(keys, aggsSearchQuery, queryFilters, contextFilters, customQueries) {
  let aggs = {};
  for (const key of keys) {
    const keyWithoutKeyword = key.replace(".keyword", "");
    let filter = unsafeStrucuredClone({ bool: { must: [], filter: contextFilters } });
    if (aggsSearchQuery) filter.bool.must.push(aggsSearchQuery);

    for (const subKey of keys) {
      const subKeyWithoutKeyword = subKey.replace(".keyword", "");
      if (subKey === key) continue;
      if (!queryFilters[subKeyWithoutKeyword]?.length) continue;
      filter = hitsSubQuery(filter, subKey, queryFilters[subKeyWithoutKeyword], customQueries);
    }

    if (customQueries?.[keyWithoutKeyword + "Aggs"]) {
      aggs[keyWithoutKeyword] = { filter, aggs: { names: customQueries[keyWithoutKeyword + "Aggs"](key) } };
    } else if (key.includes(".keyword")) {
      aggs[keyWithoutKeyword] = { filter, aggs: { names: { terms: { field: key, missing: "N/A", size: ES_NO_LIMIT } } } };
    } else {
      aggs[key] = { filter, aggs: { names: { histogram: { field: key, interval: 1, min_doc_count: 1 } } } };
    }
  }
  return aggs;
}

function buildSort(sort) {
  if (!sort) return [{ createdAt: { order: "desc" } }];
  return [{ [sort.field]: { order: sort.order } }];
}

function unsafeStrucuredClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function buildNdJson(header, hitsQuery, aggsQuery = null) {
  if (!aggsQuery) return [JSON.stringify(header), JSON.stringify(hitsQuery)].join("\n") + "\n";
  return [JSON.stringify(header), JSON.stringify(hitsQuery), JSON.stringify(header), JSON.stringify(aggsQuery)].join("\n") + "\n";
}

function buildArbitratyNdJson(...args) {
  return args.map((e) => JSON.stringify(e)).join("\n") + "\n";
}

function buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters, customQueries, size = 10 }) {
  // We always need a fresh query to avoid side effects.
  const getMainQuery = () => unsafeStrucuredClone({ bool: { must: [{ match_all: {} }], filter: contextFilters } });
  // Search query
  const search = (queryFilters.searchbar || []).filter((e) => e.trim()).length ? searchSubQuery(queryFilters.searchbar, searchFields) : null;
  // Hits request body
  const hitsRequestBody = { query: getMainQuery(), size, from: page * size, sort: buildSort(sort) };
  if (search) hitsRequestBody.query.bool.must.push(search);
  for (const key of filterFields) {
    const keyWithoutKeyword = key.replace(".keyword", "");
    if (!queryFilters[keyWithoutKeyword]?.length) continue;
    hitsRequestBody.query = hitsSubQuery(hitsRequestBody.query, key, queryFilters[keyWithoutKeyword], customQueries);
  }
  // Aggs request body
  const aggsRequestBody = { query: getMainQuery(), aggs: aggsSubQuery(filterFields, search, queryFilters, contextFilters, customQueries), size: size, track_total_hits: true };
  return { hitsRequestBody, aggsRequestBody };
}

function joiElasticSearch({ filterFields, sortFields = [], body }) {
  const schema = Joi.object({
    filters: Joi.object(
      ["searchbar", ...filterFields].reduce((acc, field) => ({ ...acc, [field.replace(".keyword", "")]: Joi.array().items(Joi.string().allow("")).max(200) }), {}),
    ),
    page: Joi.number().integer().min(0).default(0),
    sort: Joi.object({
      field: Joi.string().valid(...sortFields),
      order: Joi.string().valid("asc", "desc"),
    })
      .allow(null)
      .default(null),
    exportFields: Joi.alternatives().try(Joi.array().items(Joi.string()).max(200).allow(null).default(null), Joi.string().valid("*")),
  });

  const { error, value } = schema.validate({ ...body }, { stripUnknown: true });
  if (error) capture(error);
  return { queryFilters: value.filters, page: value.page, sort: value.sort, exportFields: value.exportFields, error };
}

module.exports = {
  buildNdJson,
  buildArbitratyNdJson,
  buildRequestBody,
  joiElasticSearch,
};
