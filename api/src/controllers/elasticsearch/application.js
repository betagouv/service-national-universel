const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const Joi = require("joi");
const { serializeApplications, serializeYoungs, serializeMissions, serializeStructures, serializeReferents } = require("../../utils/es-serializer");
const { buildApplicationContext } = require("./utils");
const {
  ROLES,
  canSearchAssociation,
  canSearchSessionPhase1,
  canSearchMeetingPoints,
  canSearchInElasticSearch,
  canViewBus,
  canSearchLigneBus,
  canViewEmailHistory,
  region2department,
  department2region,
} = require("snu-lib");

async function populateApplications(applications, exportFields) {
  if (!applications || !applications.length) return applications;

  if (exportFields.includes("youngId")) {
    const youngIds = [...new Set(applications.map((item) => item.youngId))].filter(Boolean);
    const youngs = await allRecords("young", { bool: { must: { ids: { values: youngIds } } } });
    const serializedYoungs = youngs.length ? serializeYoungs(youngs) : [];
    applications = applications.map((item) => ({ ...item, young: serializedYoungs.find((e) => e._id === item.youngId) || {} }));
  }

  if (exportFields.includes("missionId")) {
    const missionIds = [...new Set(applications.map((item) => item.missionId))].filter(Boolean);
    const missions = await allRecords("mission", { bool: { must: { ids: { values: missionIds } } } });
    const serializedMissions = missions.length ? serializeMissions(missions) : [];
    applications = applications.map((item) => ({ ...item, mission: serializedMissions.find((e) => e._id === item.missionId) || {} }));
  }

  if (exportFields.includes("tutorId")) {
    const tutorIds = [...new Set(applications.map((item) => item.tutorId))].filter(Boolean);
    const tutors = await allRecords("referent", { bool: { must: { ids: { values: tutorIds } } } });
    const serializedTutors = tutors.length ? serializeReferents(tutors) : [];
    applications = applications.map((item) => ({ ...item, tutor: serializedTutors.find((e) => e._id === item.tutorId) || {} }));
  }
  if (exportFields.includes("structureId")) {
    const structureIds = [...new Set(applications.map((item) => item.structureId))].filter(Boolean);
    const structures = await allRecords("structure", { bool: { must: { ids: { values: structureIds } } } });
    const serializedStructures = structures.length ? serializeStructures(structures) : [];
    applications = applications.map((item) => ({ ...item, structure: serializedStructures.find((e) => e._id === item.structureId) || {} }));
  }

  return applications;
}

router.post("/by-mission/:id/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["youngEmail", "youngFirstName", "youngLastName"];
    const filterFields = ["status.keyword", "contractStatus.keyword", "filesType.keyword", "youngDepartment.keyword", "missionId.keyword"];
    const sortFields = [];

    // Body params validation
    const { queryFilters, page, sort, error, size, exportFields } = joiElasticSearch({ filterFields, sortFields, body });
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
      const response = await allRecords("application", hitsRequestBody.query, esClient, exportFields);
      let data = serializeApplications(response);
      data = await populateApplications(data, exportFields);
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

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
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
      "contractStatus.keyword",
    ];
    const sortFields = [];

    if (!canSearchInElasticSearch(user, "application")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, exportFields, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body });
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
      const response = await allRecords("application", hitsRequestBody.query, esClient, exportFields);
      let data = serializeApplications(response);
      data = await populateApplications(data, exportFields);
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

router.post("/applicationByMission", async (req, res) => {
  try {
    const missionIds = req.body.missionIds; // Assurez-vous que ces IDs sont bien reçus
    console.log(missionIds);
    const query = {
      query: { bool: { filter: [{ terms: { "missionId.keyword": missionIds } }] } },
      track_total_hits: true,
      size: 1000,
    };

    console.log(query);
    // Exécutez la requête ElasticSearch ici et obtenez les résultats
    // const esResults = await executeElasticSearchQuery(query);
    const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, query) });
    console.log(response);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

router.post("/application/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // const filter = [];

    if (!canSearchInElasticSearch(user, "application")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // A responsible can only see their structure's applications.
    // if (user.role === ROLES.RESPONSIBLE) {
    //   if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    //   filter.push({ terms: { "structureId.keyword": [user.structureId] } });
    //   filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"] } });
    // }

    // // A supervisor can only see their structures' applications.
    // if (user.role === ROLES.SUPERVISOR) {
    //   if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    //   const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    //   filter.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
    //   filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"] } });
    // }

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    const contextFilters = [
      ...applicationContextFilters,
      // { term: { "missionId.keyword": req.params.id } },
      // query.tab === "pending" ? { terms: { "status.keyword": ["WAITING_VALIDATION"] } } : null,
      // query.tab === "follow" ? { terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } } : null,
    ].filter(Boolean);

    if (req.params.action === "export") {
      const response = await allRecords("application", applyFilterOnQuery(req.body.query, contextFilters), esClient, body.fieldsToExport);
      return res.status(200).send({ ok: true, data: serializeApplications(response) });
    } else {
      const response = await esClient.msearch({ index: "application", body: withFilterForMSearch(body, contextFilters) });
      return res.status(200).send(serializeApplications(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
function withFilterForMSearch(body, filter) {
  const lines = body.split(`\n`).filter((e) => e);
  if (lines.length % 2 === 1) throw new Error("Invalid body");
  if (lines.length > 100) throw new Error("Too many lines");
  return (
    lines
      .map((item, key) => {
        // Declaration line are skipped.
        if (key % 2 === 0) return item;

        const q = JSON.parse(item);
        q.query = applyFilterOnQuery(q.query, filter);

        return JSON.stringify(q);
      })
      .join(`\n`) + `\n`
  );
}

function applyFilterOnQuery(query, filter) {
  if (!query.bool) {
    if (query.match_all) {
      query = { bool: { must: { match_all: {} } } };
    } else {
      const tq = { ...query };
      query = { bool: { must: tq } };
    }
  }

  if (query.bool.filter && query.bool.filter.length < 100) query.bool.filter = [...query.bool.filter, ...filter];
  else query.bool.filter = filter;

  return query;
}

router.post("/test/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    const searchFields = ["youngEmail", "youngFirstName", "youngLastName"];
    const filterFields = [
      "status.keyword",
      "contractStatus.keyword",
      "filesType.keyword",
      "youngDepartment.keyword",
      "missionId.keyword",
      "tutorName.keyword",
      "missionName.keyword",
      "contractStatus.keyword",
    ];
    const sortFields = [];

    const { queryFilters, exportFields, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    console.log(queryFilters, exportFields, page, size);

    // const { error: errorQuery, value: query } = Joi.object({
    //   tab: Joi.string().trim().valid("all", "follow", "pending"),
    // }).validate(req.query, { stripUnknown: true });
    // if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    const contextFilters = [
      ...applicationContextFilters,
      // { term: { "missionId.keyword": req.params.id } },
      // query.tab === "pending" ? { terms: { "status.keyword": ["WAITING_VALIDATION"] } } : null,
      // query.tab === "follow" ? { terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } } : null,
    ].filter(Boolean);

    const MAX_SIZE = 100; // Définir la valeur maximale autorisée pour size
    // Construire la requête pour la recherche ou l'exportation
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      exportFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
    });
    hitsRequestBody.size = MAX_SIZE;

    if (req.params.action === "export") {
      const response = await allRecords("application", hitsRequestBody.query, esClient, exportFields);
      let data = serializeApplications(response);
      data = await populateApplications(data, exportFields);
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
      const response = await allRecords("application", hitsRequestBody.query, esClient, exportFields);
      let data = serializeApplications(response);
      data = await populateApplications(data, exportFields);
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

router.post("/count-by-status", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const filterFields = ["structureId.keyword"];

    // Body params validation
    const { queryFilters, error } = joiElasticSearch({ filterFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    const query = {
      query: {
        bool: {
          must: [...applicationContextFilters],
        },
      },
      aggs: {
        all: { filter: { terms: { "structureId.keyword": queryFilters.structureId } } },
        pending: {
          filter: { terms: { "structureId.keyword": queryFilters.structureId } },
          aggs: { pending: { filter: { terms: { "status.keyword": ["WAITING_VALIDATION"] } } } },
        },
        follow: {
          filter: { terms: { "structureId.keyword": queryFilters.structureId } },
          aggs: { follow: { filter: { terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } } } },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, query) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
