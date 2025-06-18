const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { buildNdJson, joiElasticSearch, buildRequestBody } = require("./utils");
const { ES_NO_LIMIT, ROLES, canSearchLigneBus, canSearchInElasticSearch } = require("snu-lib");
const { allRecords } = require("../../es/utils");
const { serializeYoungs } = require("../../utils/es-serializer");
const logger = require("../../logger");

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
            { bool: { must_not: { exists: { field: "deletedAt" } } } },
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
    const { user, body } = req;
    const searchFields = ["busId", "pointDeRassemblements.region", "pointDeRassemblements.city", "pointDeRassemblements.matricule", "centerCode", "centerCity", "centerRegion"];
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
      "pointDeRassemblements.matricule.keyword",
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
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
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
      size,
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

router.post("/export", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const searchFields = [];
    const filterFields = ["cohort.keyword"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(req.user, "lignebus")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, exportFields } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    let contextFilters = [{ bool: { must_not: { exists: { field: "deletedAt" } } } }];

    const { hitsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters });

    let response = await allRecords("lignebus", hitsRequestBody.query, esClient, exportFields);

    const sharedData = await prepareSharedData(response);

    const [responseWithYoungInfo, responseWithCenterInfo, responseWithMeetingPoints] = await Promise.all([
      populateWithYoungInfo(response, req.user, sharedData),
      populateWithCohesionCenterInfo(response, sharedData),
      populateWithMeetingPointsInfo(response, sharedData),
    ]);

    response = responseWithYoungInfo.map((item, index) => ({
      ...item,
      center: responseWithCenterInfo[index].center,
      meetingPoints: responseWithMeetingPoints[index].meetingPoints,
    }));

    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const prepareSharedData = async (ligneBus) => {
  const [meetingPoints, centers] = await Promise.all([
    (async () => {
      const meetingPointsIds = [...new Set(ligneBus.reduce((prev, item) => [...prev, ...item.meetingPointsIds], []).filter(Boolean))];

      if (meetingPointsIds.length > 0) {
        return await allRecords("pointderassemblement", {
          bool: { must: { ids: { values: meetingPointsIds } } },
        });
      }
      return [];
    })(),

    (async () => {
      const centerIds = [...new Set(ligneBus.map((item) => item.centerId).filter(Boolean))];

      if (centerIds.length > 0) {
        return await allRecords("cohesioncenter", {
          bool: { must: { ids: { values: centerIds } } },
        });
      }
      return [];
    })(),
  ]);

  return { meetingPoints, centers };
};

const populateWithYoungInfo = async (ligneBus, user, sharedData) => {
  try {
    const ligneIds = [...new Set(ligneBus.map((item) => item._id).filter(Boolean))];
    const pointDeRassemblements = sharedData.meetingPoints || [];

    const contextFilters = [{ terms: { "ligneId.keyword": ligneIds } }, { term: { "status.keyword": "VALIDATED" } }];

    if (user.role === ROLES.REFERENT_REGION) {
      const pdrFilterIds = pointDeRassemblements.filter((pdr) => pdr.region === user.region).map((e) => e._id);
      contextFilters.push({ terms: { "meetingPointId.keyword": pdrFilterIds } });
    }

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      const pdrFilterIds = pointDeRassemblements.filter((pdr) => user.department.includes(pdr.department)).map((e) => e._id);
      contextFilters.push({ terms: { "meetingPointId.keyword": pdrFilterIds } });
    }

    const youngs = await allRecords("young", {
      bool: {
        must: contextFilters,
        must_not: [{ term: { "cohesionStayPresence.keyword": "false" } }, { term: { "departInform.keyword": "true" } }],
      },
    });

    const youngData = serializeYoungs(youngs);

    return ligneBus.map((item) => ({
      ...item,
      youngs: youngData?.filter((e) => e.ligneId.toString() === item._id) || [],
    }));
  } catch (error) {
    logger.error("Error populating young info:", error);
    return ligneBus.map((item) => ({ ...item, youngs: [] }));
  }
};

const populateWithCohesionCenterInfo = async (ligneBus, sharedData) => {
  try {
    const centers = sharedData.centers || [];

    return ligneBus.map((item) => ({
      ...item,
      center: centers?.find((e) => e._id.toString() === item.centerId) || null,
    }));
  } catch (error) {
    logger.error("Error populating cohesion center info:", error);
    return ligneBus.map((item) => ({ ...item, center: null }));
  }
};

const populateWithMeetingPointsInfo = async (ligneBus, sharedData) => {
  try {
    const meetingPoints = sharedData.meetingPoints || [];

    return ligneBus.map((item) => ({
      ...item,
      meetingPoints: meetingPoints?.filter((e) => item.meetingPointsIds.includes(e._id.toString())) || [],
    }));
  } catch (error) {
    logger.error("Error populating meeting points info:", error);
    return ligneBus.map((item) => ({ ...item, meetingPoints: [] }));
  }
};

module.exports = router;
