const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody, buildMissionContext } = require("./utils");
const { serializeMissions } = require("../../utils/es-serializer");
const Joi = require("joi");

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
    const { queryFilters, page, sort, error, size, exportFields } = joiElasticSearch({ filterFields, sortFields, body });
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
      size,
    });

    let response;

    if (req.params.action === "export") {
      response = await allRecords("mission", hitsRequestBody.query);
    } else {
      response = await esClient.msearch({ index: "mission", body: buildNdJson({ index: "mission", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
    }

    if (req.params.action === "export") {
      // fill the missions with the tutor info
      response = await fillMissions(response, exportFields);

      return res.status(200).send({ ok: true, data: serializeMissions(response) });
    } else {
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

router.post("/young/search/", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const schema = Joi.object({
      filters: Joi.object({
        searchbar: Joi.string().allow(""),
        domains: Joi.array().items(Joi.string().allow("")),
        distance: Joi.number().integer().min(0).max(100).required(),
        location: Joi.object({
          lat: Joi.number().min(-90).max(90),
          lon: Joi.number().min(-180).max(180),
        }).required(),
        isMilitaryPreparation: Joi.boolean().default(null),
        period: Joi.string().allow("", "CUSTOM", "VACANCES", "SCOLAIRE"),
        subPeriod: Joi.array().items(Joi.string().allow("")),
        fromDate: Joi.date(),
        toDate: Joi.date(),
        hebergement: Joi.boolean(),
      }),
      page: Joi.number()
        .integer()
        .default(0)
        .custom((value, helpers) => {
          if (value < 0) {
            return 0;
          }
          return value;
        }),
      size: Joi.number().integer().min(0).default(20),
      sort: Joi.string().allow("geo", "recent", "short", "long").default("geo"),
    });
    const { error, value } = schema.validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { filters, page, size, sort } = value;

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
      from: page * 20,
      size,
      sort: [],
    };

    if (sort === "geo") body.sort.push({ _geo_distance: { location: filters.location, order: "asc", unit: "km", mode: "min" } });
    if (sort === "recent") body.sort.push({ createdAt: { order: "desc" } });
    if (sort === "short") body.sort.push({ "duration.keyword": { order: "asc" } });
    if (sort === "long") body.sort.push({ "duration.keyword": { order: "desc" } });

    if (filters.hebergement) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              geo_distance: {
                distance: `${filters.distance}km`,
                location: filters.location,
              },
            },
            { term: { "hebergement.keyword": "true" } },
          ],
          minimum_should_match: "1",
        },
      });
    } else {
      body.query.bool.must.push({
        geo_distance: {
          distance: `${filters.distance}km`,
          location: filters.location,
        },
      });
    }

    if (filters.searchbar) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: filters.searchbar,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "cross_fields",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filters.searchbar,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "phrase",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filters.searchbar,
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

    if (filters.domains?.length) body.query.bool.must.push({ terms: { "domains.keyword": filters.domains } });
    if (filters.isMilitaryPreparation !== null) body.query.bool.must.push({ term: { "isMilitaryPreparation.keyword": String(filters.isMilitaryPreparation) } });
    if (["DURING_SCHOOL", "DURING_HOLIDAYS"].includes(filters.period)) body.query.bool.must.push({ term: { "period.keyword": filters.period } });
    if (filters.period === "CUSTOM") {
      if (filters.fromDate) body.query.bool.must.push({ range: { startAt: { gte: filters.fromDate } } });
      if (filters.toDate) body.query.bool.must.push({ range: { endAt: { lte: filters.toDate } } });
    }
    if (filters.subPeriod?.length) body.query.bool.must.push({ terms: { "subPeriod.keyword": filters.subPeriod } });

    const results = await esClient.search({ index: "mission", body });
    if (results.body.error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    return res.status(200).send({ ok: true, data: results.body.hits });
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

const fillMissions = async (missions, exportFields) => {
  if (exportFields.includes("tutorId")) {
    const tutorIds = [...new Set(missions.map((item) => item.tutorId).filter((e) => e))];
    const tutors = await allRecords("referent", { bool: { must: { ids: { values: tutorIds } } } });
    missions = missions.map((item) => ({ ...item, tutor: tutors?.find((e) => e._id === item.tutorId) }));
  }
  if (exportFields.includes("structureId")) {
    const structureIds = [...new Set(missions.map((item) => item.structureId).filter((e) => e))];
    const structures = await allRecords("structure", { bool: { must: { ids: { values: structureIds } } } });
    missions = missions.map((item) => ({ ...item, structure: structures?.find((e) => e._id === item.structureId) }));
  }
  return missions;
};

module.exports = router;
