const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS, isYoung, isReferent } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const StructureObject = require("../../models/structure");
const { serializeMissions } = require("../../utils/es-serializer");

async function buildMissionContext(user) {
  const contextFilters = [];

  // A young can only see validated missions.
  if (isYoung(user)) contextFilters.push({ term: { "status.keyword": "VALIDATED" } });
  if (isReferent(user) && !canSearchInElasticSearch(user, "mission")) return { missionContextError: { status: 403, body: { ok: false, code: ERRORS.OPERATION_UNAUTHORIZED } } };

  // A responsible cans only see their structure's missions.
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { missionContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { "structureId.keyword": [user.structureId] } });
  }

  // A supervisor can only see their structures' missions.
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { missionContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    contextFilters.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
  }

  return { missionContextFilters: contextFilters };
}

router.post("/:action(search|export)", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["name", "structureName", "city", "zip"];
    const filterFields = [
      "region.keyword",
      "department.keyword",
      "status.keyword",
      "isJvaMission.keyword",
      "visibility.keyword",
      "mainDomain.keyword",
      "placesLeft",
      "tutorName.keyword",
      "isMilitaryPreparation.keyword",
      "hebergement.keyword",
      "hebergementPayant.keyword",
      "placesStatus.keyword",
      "applicationStatus.keyword",
      "structureName.keyword",
      "fromDate",
      "toDate",
    ];
    const sortFields = ["createdAt", "placesLeft", "name.keyword"];

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { missionContextFilters, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      return res.status(missionContextError.status).send(missionContextError.body);
    }

    // Context filters
    const contextFilters = [...missionContextFilters];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters: queryFilters || {},
      customQueries: {
        fromDate: (query, value) => {
          const date = new Date(value);
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          query.bool.must.push({ range: { startAt: { gte: date } } }, { range: { endAt: { gte: null } } });
          return query;
        },
        toDate: (query, value) => {
          const date = new Date(value);
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          query.bool.must.push({ range: { startAt: { gte: null } } }, { range: { endAt: { lte: date } } });
          return query;
        },
      },
      page,
      sort,
      contextFilters,
    });

    if (req.params.action === "export") {
      const response = await allRecords("mission", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: serializeMissions(response) });
    } else {
      const response = await esClient.msearch({ index: "mission", body: buildNdJson({ index: "mission", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeMissions(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/by-structure/:id/:action(search|export)", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["name", "structureName", "city", "zip"];
    const filterFields = [
      "region.keyword",
      "department.keyword",
      "status.keyword",
      "isJvaMission.keyword",
      "visibility.keyword",
      "mainDomain.keyword",
      "placesLeft",
      "tutorName.keyword",
      "isMilitaryPreparation.keyword",
      "hebergement.keyword",
      "hebergementPayant.keyword",
      "placesStatus.keyword",
      "applicationStatus.keyword",
      "fromDate",
      "toDate",
    ];
    const sortFields = ["createdAt", "placesLeft", "name.keyword"];

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { missionContextFilters, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      return res.status(missionContextError.status).send(missionContextError.body);
    }

    // Context filters
    const contextFilters = [...missionContextFilters, { terms: { "structureId.keyword": [req.params.id] } }];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      customQueries: {
        fromDate: (query, value) => {
          const date = new Date(value);
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          query.bool.must.push({ range: { startAt: { gte: date } } }, { range: { endAt: { gte: null } } });
          return query;
        },
        toDate: (query, value) => {
          const date = new Date(value);
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          query.bool.must.push({ range: { startAt: { gte: null } } }, { range: { endAt: { lte: date } } });
          return query;
        },
      },
      page,
      sort,
      contextFilters,
    });

    if (req.params.action === "export") {
      const response = await allRecords("mission", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: serializeMissions(response) });
    } else {
      const response = await esClient.msearch({ index: "mission", body: buildNdJson({ index: "mission", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeMissions(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/propose/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["name.folded^10", "description", "justifications", "contraintes", "frequence", "period"];
    const filterFields = [];
    const sortFields = [];

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { missionContextFilters, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      return res.status(missionContextError.status).send(missionContextError.body);
    }

    // Context filters
    const contextFilters = [
      ...missionContextFilters,
      {
        bool: {
          must: [
            {
              script: {
                script: "doc['pendingApplications'].value < doc['placesLeft'].value * 5",
              },
            },
            {
              range: {
                endAt: {
                  gt: "now",
                },
              },
            },
            { term: { "status.keyword": "VALIDATED" } },
            { term: { "visibility.keyword": "VISIBLE" } },
            {
              range: {
                placesLeft: {
                  gt: 0,
                },
              },
            },
          ],
        },
      },
    ];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
    });

    if (req.params.action === "export") {
      const response = await allRecords("mission", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "mission", body: buildNdJson({ index: "mission", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/by-tutor/:id/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = [];
    const filterFields = [];
    const sortFields = [];

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { missionContextFilters, missionContextError } = await buildMissionContext(user);
    if (missionContextError) {
      return res.status(missionContextError.status).send(missionContextError.body);
    }

    // Context filters
    const contextFilters = [...missionContextFilters, { terms: { "tutorId.keyword": [req.params.id] } }];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size: 5,
    });

    if (req.params.action === "export") {
      const response = await allRecords("mission", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "mission", body: buildNdJson({ index: "mission", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
