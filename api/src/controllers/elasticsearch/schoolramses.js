const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, ES_NO_LIMIT, canSearchInElasticSearch } = require("snu-lib");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const { serializeRamsesSchools } = require("../../utils/es-serializer");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["fullName", "city", "zip", "code2022", "typology", "domain"];
    const filterFields = ["region.keyword", "departmentName.keyword", "cohort", "academy"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "schoolramses")) return res.status(418).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [];
    if (req.user.role === ROLES.REFERENT_REGION) contextFilters.push({ term: { "region.keyword": req.user.region } });
    if (req.user.role === ROLES.REFERENT_DEPARTMENT) contextFilters.push({ terms: { "department.keyword": req.user.department } });

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
    });

    async function getYoungsFromSchoolIds(schoolsIds) {
      const body = {
        query: {
          bool: {
            must: { match_all: {} },
            filter: [
              { terms: { "schoolId.keyword": schoolsIds } },
              req.user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "department.keyword": req.user.department } } : null,
              req.user.role === ROLES.REFERENT_REGION ? { terms: { "region.keyword": req.user.region } } : null,
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
      const responseYoungs = await esClient.msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, body) });
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
        await esClient.msearch({ index: "schoolramses", body: buildNdJson({ index: "schoolramses", type: "_doc" }, hitsRequestBody, aggsRequestBody) }),
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

module.exports = router;
