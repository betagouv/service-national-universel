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
const Joi = require("joi");

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

router.post("/find/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const schema = Joi.object({
      filters: Joi.object({
        searchbar: Joi.string().allow(""),
        domains: Joi.array().items(Joi.string().allow("")),
        distance: Joi.number().integer().min(0).max(1000),
        location: Joi.object({
          lat: Joi.number().min(-90).max(90),
          lon: Joi.number().min(-180).max(180),
        }),
        isMilitaryPreparation: Joi.boolean(),
        period: Joi.string().allow(""),
        subPeriod: Joi.array().items(Joi.string().allow("")),
        fromDate: Joi.date(),
        toDate: Joi.date(),
        hebergement: Joi.boolean(),
      }),
      page: Joi.number().integer().min(0).max(1000),
      sort: Joi.string().allow(""),
    });
    const { error, value } = schema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    let body = {
      query: {
        bool: {
          must: [
            { script: { script: "doc['pendingApplications'].value < doc['placesLeft'].value * 5" } },
            { range: { endAt: { gt: "now" } } },
            { term: { "status.keyword": "VALIDATED" } },
            { term: { "visibility.keyword": "VISIBLE" } },
            { range: { placesLeft: { gt: 0 } } },
          ],
        },
      },
      sort: [{ createdAt: { order: "desc" } }],
    };

    if (value.searchbar) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: value.SEARCH,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "cross_fields",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: value.SEARCH,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "phrase",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: value.SEARCH,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "phrase_prefix",
                operator: "and",
              },
            },
          ],
          minimum_should_match: "1",
        },
      });
    }

    if (value.domains?.length) body.query.bool.filter.push({ terms: { "domains.keyword": value.domains } });
    if (value?.period?.length) body.query.bool.filter.push({ terms: { "period.keyword": value.period } });
    if (value?.isMilitaryPreparation) body.query.bool.filter.push({ term: { "isMilitaryPreparation.keyword": value?.isMilitaryPreparation } });
    if (value?.fromDate && Object.keys(value?.fromDate).length) body.query.bool.filter?.push({ range: { startAt: value.fromDate } });
    if (value?.toDate && Object.keys(value?.toDate).length) body.query.bool.filter.push({ range: { endAt: value.toDate } });
    console.log("🚀 ~ file: mission.js:290 ~ router.post ~ body:", JSON.stringify(body));

    const results = await esClient.search({ index: "mission", body });
    console.log("🚀 ~ file: mission.js:337 ~ router.post ~ results:", results)

    return res.status(200).send({ ok: true, data: results.body.hits.hits });
  } catch (error) {
    console.log("🚀 ~ file: mission.js:340 ~ router.post ~ error:", error)
    // capture(error);
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
