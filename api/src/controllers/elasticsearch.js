const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib/roles");
const { capture } = require("../sentry");
const esClient = require("../es");
const { ERRORS } = require("../utils");

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

function aggsSubQuery(keys, aggsSearchQuery, filters) {
  let aggs = {};
  for (const key of keys) {
    let filter = { bool: { must: [], filter: [] } };
    if (aggsSearchQuery) filter.bool.must.push(aggsSearchQuery);

    for (const subKey of keys) {
      if (subKey === key) continue;
      if (!filters[subKey.replace(".keyword", "")]?.length) continue;
      filter = hitsSubQuery(filter, subKey, filters[subKey.replace(".keyword", "")]);
    }

    if (key.includes(".keyword")) {
      aggs[key.replace(".keyword", "")] = { filter, aggs: { names: { terms: { field: key, missing: "N/A", size: ES_NO_LIMIT } } } };
    } else {
      aggs[key] = { filter, aggs: { names: { histogram: { field: key, interval: 1, min_doc_count: 1 } } } };
    }
  }
  return aggs;
}

function buildNdJson(header, hitsQuery, aggsQuery) {
  return [JSON.stringify(header), JSON.stringify(hitsQuery), JSON.stringify(header), JSON.stringify(aggsQuery)].join("\n") + "\n";
}

router.post("/cohesioncenter/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    if (!canSearchInElasticSearch(user, "cohesioncenter")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const header = { index: "cohesioncenter", type: "_doc" };

    const hitsQuery = {
      query: { bool: { must: [{ match_all: {} }], filter: [] } },
      size: 20,
      from: body.page * 20,
      sort: [{ createdAt: { order: "desc" } }],
      track_total_hits: true,
    };
    if (user.role === ROLES.REFERENT_REGION) hitsQuery.query.bool.filter.push({ term: { "region.keyword": user.region } });
    if (user.role === ROLES.REFERENT_DEPARTMENT) hitsQuery.query.bool.filter.push({ terms: { "department.keyword": user.department } });
    if (body.filters.searchbar) hitsQuery.query.bool.must.push(searchSubQuery(body.filters.searchbar, ["name", "city", "zip", "code2022"]));
    if (body.filters.department?.length) hitsQuery.query = hitsSubQuery(hitsQuery.query, "department.keyword", body.filters.department);
    if (body.filters.region?.length) hitsQuery.query = hitsSubQuery(hitsQuery.query, "region.keyword", body.filters.region);
    if (body.filters.cohorts?.length) hitsQuery.query = hitsSubQuery(hitsQuery.query, "cohorts.keyword", body.filters.cohorts);
    if (body.filters.code2022?.length) hitsQuery.query = hitsSubQuery(hitsQuery.query, "code2022.keyword", body.filters.code2022);

    let aggsSearchQuery = null;
    const aggsQuery = { query: { bool: { must: [{ match_all: {} }], filter: [] } }, aggs: {}, size: 0, track_total_hits: true };
    if (user.role === ROLES.REFERENT_REGION) aggsQuery.push({ term: { "region.keyword": user.region } });
    if (user.role === ROLES.REFERENT_DEPARTMENT) aggsQuery.push({ terms: { "department.keyword": user.department } });
    if (body.filters.searchbar) aggsSearchQuery = searchSubQuery(body.filters.searchbar, ["name", "city", "zip", "code2022"]);
    const aggs = aggsSubQuery(["department.keyword", "region.keyword", "cohorts.keyword", "code2022.keyword"], aggsSearchQuery, body.filters);
    if (Object.keys(aggs).length) aggsQuery.aggs = aggs;

    if (req.params.action === "export") {
      // todo.
    } else {
      const body = buildNdJson(header, hitsQuery, aggsQuery);
      const response = await esClient.msearch({ index: "cohesioncenter", body });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
