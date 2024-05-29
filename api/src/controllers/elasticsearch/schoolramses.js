const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, ES_NO_LIMIT, canSearchInElasticSearch } = require("snu-lib");
const { capture } = require("../../sentry");
const { esClient } = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const { serializeRamsesSchools } = require("../../utils/es-serializer");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    async function getYoungsFromSchoolIds(schoolsIds) {
      const body = {
        query: {
          bool: {
            must: { match_all: {} },
            filter: [
              { terms: { "schoolId.keyword": schoolsIds } },
              req.user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "department.keyword": req.user.department } } : null,
              [ROLES.REFERENT_REGION, ROLES.VISITOR].includes(req.user.role) ? { term: { "region.keyword": req.user.region } } : null,
              queryFilters.cohort?.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
              queryFilters.academy?.length ? { terms: { "academy.keyword": queryFilters.academy } } : null,
            ].filter(Boolean),
          },
        },
        aggs: {
          school: {
            terms: { field: "schoolId.keyword", size: ES_NO_LIMIT },
            aggs: { departments: { terms: { field: "department.keyword" } }, firstUser: { top_hits: { size: 1 } } },
          },
        },
        size: 0,
        track_total_hits: true,
      };
      const responseYoungs = await esClient().msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, body) });
      const reducedSchool = responseYoungs.body.responses[0].aggregations.school.buckets.reduce((acc, school) => {
        if (school.key === "") return acc;
        const schoolInfo = school.firstUser?.hits?.hits[0]?._source;
        const total = school.doc_count;
        const isThereDep = school.departments?.buckets?.find((f) => f.key === schoolInfo.schoolDepartment) || {};
        const inDepartment = isThereDep.doc_count || 0;
        const outDepartment = total - inDepartment;
        if (!acc[school.key]) {
          acc[school.key] = {
            schoolId: school.key,
            total,
            inDepartment,
            outDepartment,
          };
        }
        return acc;
      }, {});
      return reducedSchool;
    }

    // Configuration
    const { user, body } = req;
    const searchFields = ["fullName", "city", "zip", "code2022", "typology", "domain"];
    const filterFields = ["region.keyword", "departmentName.keyword", "cohort", "academy"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "schoolramses")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];
    if ([ROLES.REFERENT_REGION, ROLES.VISITOR].includes(req.user.role)) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "departmentName.keyword": req.user.department } });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters: {
        region: queryFilters["region"],
        departmentName: queryFilters["departmentName"],
        searchbar: queryFilters["searchbar"],
      },
      page,
      sort,
      contextFilters,
      size,
    });

    if (req.params.action === "export") {
      let response = serializeRamsesSchools(await allRecords("schoolramses", hitsRequestBody.query));
      const reducedSchool = await getYoungsFromSchoolIds(response.map((h) => h._id));
      response = response.map((h) => {
        const schoolInfo = reducedSchool[h._id];
        if (!schoolInfo) return h;
        return { ...h, ...schoolInfo };
      });
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = serializeRamsesSchools(
        await esClient().msearch({ index: "schoolramses", body: buildNdJson({ index: "schoolramses", type: "_doc" }, hitsRequestBody, aggsRequestBody) }),
      );
      const reducedSchool = await getYoungsFromSchoolIds(response.body.responses[0].hits.hits.map((h) => h._id));
      response.body.responses[0].hits.hits = response.body.responses[0].hits.hits.map((h) => {
        const schoolInfo = reducedSchool[h._id];
        if (!schoolInfo) return h;
        return { ...h, _source: { ...h._source, ...schoolInfo } };
      });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/public/search", async (req, res) => {
  try {
    const { body } = req;

    const filterFields = ["country.keyword", "departmentName.keyword", "city.keyword"];
    const { queryFilters } = joiElasticSearch({ filterFields, body });

    let query = {};

    if (req.query.searchCity) {
      query = {
        query: {
          match_bool_prefix: {
            "city.folded": req.query.searchCity,
          },
        },
      };
    } else {
      query = {
        query: {
          bool: {
            must: { match_all: {} },
            filter: [],
          },
        },
        size: ES_NO_LIMIT,
      };
    }

    if (queryFilters?.country) {
      query.query.bool.filter.push({
        terms: {
          "country.keyword": queryFilters.country,
        },
      });
    }

    if (queryFilters?.departmentName) {
      query.query.bool.filter.push({
        terms: {
          "departmentName.keyword": queryFilters.departmentName,
        },
      });
    }

    if (queryFilters?.city) {
      query.query.bool.filter.push({
        terms: {
          "city.keyword": queryFilters.city,
        },
      });
    }

    if (req.query.aggsByCountries) {
      query.size = 0;
      query.aggs = {
        countries: { terms: { field: "country.keyword", size: ES_NO_LIMIT } },
      };
    }

    if (req.query.aggsByCities) {
      query.size = 0;
      query.aggs = {
        cities: { terms: { field: "city.keyword", size: ES_NO_LIMIT } },
      };
    }

    if (req.query.aggsByCitiesAndDepartments) {
      query.size = 0;
      query.aggs = {
        cities: {
          multi_terms: {
            terms: [{ field: "city.keyword" }, { field: "departmentName.keyword" }],
            order: { avg_score: "desc" },
          },
          aggs: {
            avg_score: {
              avg: { script: "_score" },
            },
          },
        },
      };
    }

    const response = await esClient().msearch({ index: "schoolramses", body: buildNdJson({ index: "schoolramses", type: "_doc" }, query) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
