const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { buildNdJson, joiElasticSearch, buildRequestBody } = require("./utils");
const { ES_NO_LIMIT, canSearchLigneBus } = require("snu-lib");
const { allRecords } = require("../../es/utils");

router.post("/by-point-de-rassemblement/aggs", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { queryFilters, error } = joiElasticSearch({ filterFields: ["meetingPointIds", "cohort"], body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const body = {
      query: {
        bool: {
          filter: [
            { terms: { "meetingPointsIds.keyword": queryFilters.meetingPointIds } },
            queryFilters.cohort.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        group_by_meetingPointId: {
          terms: { field: "meetingPointsIds.keyword", size: ES_NO_LIMIT },
        },
        group_by_cohort: {
          terms: { field: "cohort.keyword", size: ES_NO_LIMIT },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    const response = await esClient.msearch({ index: "lignebus", body: buildNdJson({ index: "lignebus", type: "_doc" }, body) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/search", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = ["busId", "pointDeRassemblements.region", "pointDeRassemblements.city", "centerCode", "centerCity", "centerRegion"];
    const filterFields = [
      "busId.keyword",
      "cohort.keyword",
      "departureString.keyword",
      "returnString.keyword",
      "pointDeRassemblements.name.keyword",
      "pointDeRassemblements.region.keyword",
      "pointDeRassemblements.department.keyword",
      "pointDeRassemblements.city.keyword",
      "pointDeRassemblements.code.keyword",
      "centerName.keyword",
      "centerRegion.keyword",
      "centerDepartment.keyword",
      "centerCode.keyword",
      "modificationBuses.requestMessage.keyword",
      "modificationBuses.status.keyword",
      "modificationBuses.opinion.keyword",
      "lineFillingRate",
    ];
    const sortFields = [];

    // Authorization
    if (!canSearchLigneBus(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    let contextFilters = [{ bool: { must_not: { exists: { field: "deletedAt" } } } }];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
    });
    const response = await esClient.msearch({
      index: "lignebus",
      body: buildNdJson({ index: "lignebus", type: "_doc" }, hitsRequestBody, aggsRequestBody),
    });
    const lignesBus =
      response && response.body && response.body.responses && response.body.responses.length > 0 && response.body.responses[0].hits && response.body.responses[0].hits.hits
        ? response.body.responses[0].hits.hits
        : [];

    const centerIds = [...new Set(lignesBus.map((item) => item._source.centerId).filter((e) => e))];
    if (centerIds.length > 0) {
      // --- fill center
      const centers = await allRecords("cohesioncenter", {
        bool: {
          must: {
            match_all: {},
          },
          filter: [{ terms: { _id: centerIds } }],
        },
      });
      if (centers.length > 0) {
        for (let ligneBus of lignesBus) {
          ligneBus._source.center = centers.find((c) => c._id === ligneBus._source.centerId);
        }
      }
    }

    const meetingPointsIds = [...new Set(lignesBus.reduce((prev, item) => [...prev, ...item._source.meetingPointsIds], []))];
    if (meetingPointsIds.length > 0) {
      // --- fill lignetopoint
      const lignesToPoint = await allRecords("lignetopoint", {
        bool: {
          must: {
            match_all: {},
          },
          filter: [{ terms: { "meetingPointId.keyword": meetingPointsIds } }],
        },
      });
      // --- fill meetingPoint
      const meetingPoints = await allRecords("pointderassemblement", {
        bool: {
          must: {
            match_all: {},
          },
          filter: [{ terms: { _id: meetingPointsIds } }],
        },
      });
      console.log("✍️  meetingPoints:", meetingPoints);
      if (lignesToPoint.length > 0) {
        for (let ligneBus of lignesBus) {
          const ltp = lignesToPoint
            .filter((l) => ligneBus._source.meetingPointsIds.includes(l.meetingPointId))
            .sort((a, b) => a.departureHour.replace(":", "") - b.departureHour.replace(":", ""));
          for (let l of ltp) {
            l.meetingPoint = meetingPoints.find((mp) => mp._id.toString() === l.meetingPointId);
          }
          ligneBus._source.lignesToPoint = ltp;
        }
      }
    }

    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
