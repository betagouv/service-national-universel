const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const StructureObject = require("../../models/structure");
const Joi = require("joi");
const { serializeApplications } = require("../../utils/es-serializer");

async function buildApplicationContext(user) {
  const contextFilters = [];

  if (!canSearchInElasticSearch(user, "application")) return { applicationContextError: { status: 403, body: { ok: false, code: ERRORS.OPERATION_UNAUTHORIZED } } };

  // A responsible can only see their structure's applications.
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { applicationContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { "structureId.keyword": [user.structureId] } });
    contextFilters.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"] } });
  }

  // A supervisor can only see their structures' applications.
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { applicationContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    contextFilters.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
    contextFilters.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"] } });
  }

  return { applicationContextFilters: contextFilters };
}

router.post("/by-mission/:id/:action(search|export)", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["youngEmail", "youngFirstName", "youngLastName"];
    const filterFields = ["status.keyword", "contractStatus.keyword", "filesType.keyword", "youngDepartment.keyword", "missionId.keyword"];
    const sortFields = [];

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error: errorQuery, value: query } = Joi.object({
      tab: Joi.string().trim().valid("all", "follow", "pending"),
    }).validate(req.query, { stripUnknown: true });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    // Context filters
    const contextFilters = [
      ...applicationContextFilters,
      { term: { "missionId.keyword": req.params.id } },
      query.tab === "pending" ? { terms: { "status.keyword": ["WAITING_VALIDATION"] } } : null,
      query.tab === "follow" ? { terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } } : null,
    ].filter(Boolean);

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

    if (req.params.action === "export") {
      const response = await allRecords("application", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: serializeApplications(response) });
    } else {
      const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeApplications(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:action(search|export)", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["youngEmail", "youngFirstName", "youngLastName"];
    const filterFields = [
      "status.keyword",
      "contractStatus.keyword",
      "filesType.keyword",
      "youngDepartment.keyword",
      "missionId.keyword",
      "tutorName.keyword",
      "missionName.keyword",
    ];
    const sortFields = [];

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error: errorQuery, value: query } = Joi.object({
      tab: Joi.string().trim().valid("all", "follow", "pending"),
    }).validate(req.query, { stripUnknown: true });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    // Context filters
    const contextFilters = [
      ...applicationContextFilters,
      // { term: { "missionId.keyword": req.params.id } },
      query.tab === "pending" ? { terms: { "status.keyword": ["WAITING_VALIDATION"] } } : null,
      query.tab === "follow" ? { terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } } : null,
    ].filter(Boolean);

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

    if (req.params.action === "export") {
      const response = await allRecords("application", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: serializeApplications(response) });
    } else {
      const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeApplications(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/by-young/:id/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = [];
    const filterFields = [];
    const sortFields = ["priority.keyword"];

    // Body params validation
    const { queryFilters, page, sort, exportFields, error, size } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    // Context filters
    const contextFilters = [...applicationContextFilters, { term: { "youngId.keyword": req.params.id } }].filter(Boolean);

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

    if (req.params.action === "export") {
      console.log("hitsRequestBody", exportFields);
      let response = await allRecords("application", hitsRequestBody.query, esClient, exportFields);

      let data = serializeApplications(response);

      if (exportFields.includes("youngId")) {
        const youngIds = [...new Set(data.map((item) => item.youngId))];
        const youngs = await allRecords("young", { bool: { must: { ids: { values: youngIds } } } });
        data = data.map((item) => ({ ...item, young: youngs.find((e) => e._id === item.youngId) || {} }));
      }

      if (exportFields.includes("missionId")) {
        const missionIds = [...new Set(data.map((item) => item.missionId))];
        const missions = await allRecords("mission", { bool: { must: { ids: { values: missionIds } } } });
        data = data.map((item) => ({ ...item, mission: missions.find((e) => e._id === item.missionId) || {} }));
      }

      if (exportFields.includes("tutorId")) {
        const tutorIds = [...new Set(data.map((item) => item.tutorId))];
        const tutors = await allRecords("referent", { bool: { must: { ids: { values: tutorIds } } } });
        data = data.map((item) => ({ ...item, tutor: tutors.find((e) => e._id === item.tutorId) || {} }));
      }
      if (exportFields.includes("structureId")) {
        const structureIds = [...new Set(data.map((item) => item.structureId))];
        const structures = await allRecords("structure", { bool: { must: { ids: { values: structureIds } } } });
        data = data.map((item) => ({ ...item, structure: structures.find((e) => e._id === item.structureId) || {} }));
      }

      return res.status(200).send({ ok: true, data });
    } else {
      const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, hitsRequestBody, aggsRequestBody) });

      return res.status(200).send(serializeApplications(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
