const passport = require("passport");
const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { ROLES, canSearchInElasticSearch, YOUNG_STATUS_PHASE1, ES_NO_LIMIT, youngExportFields } = require("snu-lib");
const datesub = require("date-fns/sub");
const { capture } = require("../../sentry");
const { esClient } = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("./utils");

const { serializeApplications, serializeYoungs, serializeMissions, serializeStructures, serializeReferents } = require("../../utils/es-serializer");
const StructureObject = require("../../models/structure");
const ApplicationObject = require("../../models/application");
const SessionPhase1Object = require("../../models/sessionPhase1");
const CohesionCenterObject = require("../../models/cohesionCenter");
const MissionObject = require("../../models/mission");
const { getCohortNamesEndAfter } = require("../../utils/cohort");
const { populateYoungExport } = require("./populate/populateYoung");

function getYoungsFilters(user) {
  return [
    "cohort.keyword",
    "originalCohort.keyword",
    "status.keyword",
    "country.keyword",
    "academy.keyword",
    "region.keyword",
    "department.keyword",
    "hasNotes.keyword",
    "grade.keyword",
    "gender.keyword",
    user.role === ROLES.REFERENT_DEPARTMENT ? "schoolName.keyword" : null,
    "situation.keyword",
    "ppsBeneficiary.keyword",
    "paiBeneficiary.keyword",
    "isRegionRural.keyword",
    "qpv.keyword",
    "handicap.keyword",
    "allergies.keyword",
    "specificAmenagment.keyword",
    "reducedMobilityAccess.keyword",
    "imageRight.keyword",
    "CNIFileNotValidOnStart.keyword",
    "statusPhase1.keyword",
    "hasMeetingInformation.keyword",
    "handicapInSameDepartment.keyword",
    "youngPhase1Agreement.keyword",
    "cohesionStayPresence.keyword",
    "presenceJDM.keyword",
    "departInform.keyword",
    "departSejourMotif.keyword",
    "cohesionStayMedicalFileReceived.keyword",
    "ligneId.keyword",
    "isTravelingByPlane.keyword",
    "statusPhase2.keyword",
    "phase2ApplicationStatus.keyword",
    "statusPhase2Contract.keyword",
    "statusMilitaryPreparationFiles.keyword",
    "phase2ApplicationFilesType.keyword",
    "status_equivalence.keyword",
    "statusPhase3.keyword",
    "schoolDepartment.keyword",
    "parentAllowSNU.keyword",
    "sessionPhase1Id.keyword",
    "source.keyword",
    "classeId.keyword",
    "etablissementId.keyword",
  ].filter(Boolean);
}

async function buildYoungContext(user, showAffectedToRegionOrDep = false) {
  const contextFilters = [];

  if (user.role !== ROLES.ADMIN)
    contextFilters.push({
      terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST", "ABANDONED", "REINSCRIPTION"] },
    });

  // Open in progress inscription to referent
  if (user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) contextFilters[0].terms["status.keyword"].push("IN_PROGRESS");

  // A head center can only see youngs of their session.
  if (user.role === ROLES.HEAD_CENTER) {
    const sessionPhase1 = await SessionPhase1Object.find({ headCenterId: user._id });
    if (!sessionPhase1.length) return { youngContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push(
      { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } },
      { terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } },
    );
    const visibleCohorts = await getCohortNamesEndAfter(datesub(new Date(), { months: 3 }));
    if (visibleCohorts.length > 0) {
      contextFilters.push({ terms: { "cohort.keyword": visibleCohorts } });
    } else {
      // Tried that to specify when there's just no data or when the head center has no longer access
      return { youngContextError: { status: 404, body: { ok: true, code: "no cohort available" } } };
    }
  }
  // A responsible can only see youngs in application of their structure.
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { youngContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const applications = await ApplicationObject.find({ structureId: user.structureId });
    contextFilters.push({ terms: { _id: applications.map((e) => e.youngId) } });
  }

  // A supervisor can only see youngs in application of their structures.
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { youngContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const structures = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    const applications = await ApplicationObject.find({ structureId: { $in: structures.map((e) => e._id.toString()) } });
    contextFilters.push({ terms: { _id: applications.map((e) => e.youngId) } });
  }

  if (user.role === ROLES.REFERENT_REGION && !showAffectedToRegionOrDep) {
    contextFilters.push({ term: { "region.keyword": user.region } });
  }

  if (user.role === ROLES.REFERENT_REGION && showAffectedToRegionOrDep) {
    const sessionPhase1 = await SessionPhase1Object.find({ region: user.region });
    if (sessionPhase1.length === 0) {
      contextFilters.push({ term: { "region.keyword": user.region } });
    } else {
      contextFilters.push({
        bool: {
          should: [{ terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } }, { term: { "region.keyword": user.region } }],
        },
      });
    }
  }

  if (user.role === ROLES.REFERENT_DEPARTMENT && !showAffectedToRegionOrDep) {
    contextFilters.push({ terms: { "department.keyword": user.department } });
  }
  if (user.role === ROLES.REFERENT_DEPARTMENT && !showAffectedToRegionOrDep) {
    const sessionPhase1 = await SessionPhase1Object.find({ department: { $in: user.department } });
    if (sessionPhase1.length === 0) {
      contextFilters.push({ terms: { "department.keyword": user.department } });
    } else {
      contextFilters.push({
        bool: {
          should: [
            { terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } },
            { terms: { "department.keyword": user.department } },
          ],
        },
      });
    }
  }

  // Visitors are limited to their region.
  if (user.role === ROLES.VISITOR) {
    contextFilters.push({ term: { "region.keyword": user.region } });
  }
  return { youngContextFilters: contextFilters };
}

router.post("/in-bus/:ligneId/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const { user, body } = req;
    const searchFields = ["email", "firstName", "lastName", "city", "zip"];
    const filterFields = ["meetingPointId.keyword", "meetingPointName.keyword", "meetingPointCity.keyword", "region.keyword", "department.keyword"];
    const sortFields = [];
    const { youngContextFilters, youngContextError } = await buildYoungContext(req.user, true);
    if (youngContextError) {
      return res.status(youngContextError.status).send(youngContextError.body);
    }

    // Context filters
    const contextFilters = [
      ...youngContextFilters,
      { terms: { "ligneId.keyword": [String(req.params.ligneId)] } },
      { terms: { "status.keyword": ["VALIDATED"] } },
      { bool: { must_not: [{ term: { "cohesionStayPresence.keyword": "false" } }, { term: { "departInform.keyword": "true" } }] } },
    ];

    // Body params validation
    const { queryFilters, page, exportFields, error, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort: { field: "lastName.keyword", order: "asc" },
      contextFilters,
      size,
      customQueries: {
        meetingPointName: (query, value) => {
          query.bool.must.push({ terms: { "meetingPointId.keyword": value } });
          return query;
        },
        meetingPointCity: (query, value) => {
          query.bool.must.push({ terms: { "meetingPointId.keyword": value } });
          return query;
        },
        meetingPointNameAggs: () => {
          return { terms: { field: "meetingPointId.keyword", missing: "N/A", size: ES_NO_LIMIT } };
        },
        meetingPointCityAggs: () => {
          return { terms: { field: "meetingPointId.keyword", missing: "N/A", size: ES_NO_LIMIT } };
        },
      },
    });
    if (req.params.action === "export") {
      const response = await allRecords("young", hitsRequestBody.query, esClient(), exportFields);
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      const response = await esClient().msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeYoungs(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/by-point-de-rassemblement/aggs", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { queryFilters, error } = joiElasticSearch({ filterFields: ["meetingPointIds", "cohort"], body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { youngContextFilters, youngContextError } = await buildYoungContext(req.user, true);
    if (youngContextError) {
      return res.status(youngContextError.status).send(youngContextError.body);
    }

    const bodyQuery = {
      query: {
        bool: {
          must_not: [{ term: { "cohesionStayPresence.keyword": "false" } }, { term: { "departInform.keyword": "true" } }],
          filter: [
            ...youngContextFilters,
            { terms: { "meetingPointId.keyword": queryFilters.meetingPointIds } },
            { terms: { "status.keyword": ["VALIDATED"] } },
            queryFilters.cohort.length ? { terms: { "cohort.keyword": queryFilters.cohort } } : null,
          ].filter(Boolean),
        },
      },
      aggs: {
        group_by_meetingPointId: {
          terms: { field: "meetingPointId.keyword", size: ES_NO_LIMIT },
        },
        group_by_cohort: {
          terms: { field: "cohort.keyword", size: ES_NO_LIMIT },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    const response = await esClient().msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, bodyQuery) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/by-point-de-rassemblement/:meetingPointId/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    // Configuration
    const { user, body } = req;
    const searchFields = ["email", "firstName", "lastName", "city", "zip"];
    const filterFields = ["cohort.keyword", "region.keyword", "sessionPhase1Id.keyword", "sessionPhase1Name", "sessionPhase1City", "department.keyword", "ligneId.keyword"];
    const sortFields = [];

    const { youngContextFilters, youngContextError } = await buildYoungContext(req.user, true);
    if (youngContextError) {
      return res.status(youngContextError.status).send(youngContextError.body);
    }

    // Context filters
    const contextFilters = [
      ...youngContextFilters,
      { terms: { "meetingPointId.keyword": [String(req.params.meetingPointId)] } },
      { terms: { "status.keyword": ["VALIDATED"] } },
      { bool: { must_not: [{ term: { "cohesionStayPresence.keyword": "false" } }, { term: { "departInform.keyword": "true" } }] } },
    ];

    // Body params validation
    const { queryFilters, page, exportFields, error, size } = joiElasticSearch({ filterFields, sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      size,
      sort: { field: "lastName.keyword", order: "asc" },
      contextFilters,
      customQueries: {
        sessionPhase1Name: (query, value) => {
          query.bool.must.push({ terms: { "sessionPhase1Id.keyword": value } });
          return query;
        },
        sessionPhase1City: (query, value) => {
          query.bool.must.push({ terms: { "sessionPhase1Id.keyword": value } });
          return query;
        },
        sessionPhase1NameAggs: () => {
          return { terms: { field: "sessionPhase1Id.keyword", missing: "N/A", size: ES_NO_LIMIT } };
        },
        sessionPhase1CityAggs: () => {
          return { terms: { field: "sessionPhase1Id.keyword", missing: "N/A", size: ES_NO_LIMIT } };
        },
      },
    });
    if (req.params.action === "export") {
      const response = await allRecords("young", hitsRequestBody.query, esClient(), exportFields);
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      const response = await esClient().msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeYoungs(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/by-session/:sessionId/:action(search|export|exportBus)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

    // Configuration
    const searchFields = ["email", "firstName", "lastName", "city", "zip"];
    const filterFields = [
      "status.keyword",
      "statusPhase1.keyword",
      "region.keyword",
      "department.keyword",
      "gender.keyword",
      "grade.keyword",
      "situation.keyword",
      "handicap.keyword",
      "ppsBeneficiary.keyword",
      "paiBeneficiary.keyword",
      "isRegionRural.keyword",
      "qpv.keyword",
      "allergies.keyword",
      "specificAmenagment.keyword",
      "reducedMobilityAccess.keyword",
      "cohesionStayMedicalFileReceived.keyword",
      "imageRight.keyword",
      "autoTestPCR.keyword",
      "cohesionStayPresence.keyword",
      "presenceJDM.keyword",
      "departInform.keyword",
      "departSejourMotif.keyword",
      "youngPhase1Agreement.keyword",
    ];
    const sortFields = [];

    if (!canSearchInElasticSearch(user, "sessionphase1young")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Context filters
    const contextFilters = [
      { terms: { "sessionPhase1Id.keyword": [String(req.params.sessionId)] } },
      { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST"] } },
      req.params.action === "exportBus" ? { bool: { must_not: [{ term: { "cohesionStayPresence.keyword": "false" } }, { term: { "departInform.keyword": "true" } }] } } : null,
    ].filter(Boolean);

    if (user.role === ROLES.HEAD_CENTER) {
      const sessionsPhase1 = await SessionPhase1Object.find({ headCenterId: user._id });
      if (!sessionsPhase1.length) return res.status(200).send({ ok: false, code: ERRORS.NOT_FOUND });
      const visibleCohorts = await getCohortNamesEndAfter(datesub(new Date(), { months: 3 }));
      if (visibleCohorts.length > 0) {
        contextFilters.push({ terms: { "cohort.keyword": visibleCohorts } });
      } else {
        // Tried that to specify when there's just no data or when the head center has no longer access
        return res.status(200).send({ ok: true, data: "no cohort available" });
      }
      if (!sessionsPhase1.map((e) => e._id.toString()).includes(req.params.sessionId)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }
    if (user.role === ROLES.REFERENT_REGION) {
      const centers = await CohesionCenterObject.find({ region: user.region });
      const sessionsPhase1 = await SessionPhase1Object.find({ cohesionCenterId: { $in: centers.map((e) => e._id.toString()) } });
      if (!sessionsPhase1.map((e) => e._id.toString()).includes(req.params.sessionId)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      const centers = await CohesionCenterObject.find({ department: user.department });
      const sessionsPhase1 = await SessionPhase1Object.find({ cohesionCenterId: { $in: centers.map((e) => e._id.toString()) } });
      if (!sessionsPhase1.map((e) => e._id.toString()).includes(req.params.sessionId)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    // Body params validation
    const { queryFilters, page, exportFields, error, size } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort: { field: "lastName.keyword", order: "asc" },
      contextFilters,
      size,
    });

    let response;

    if (["export", "exportBus"].includes(req.params.action)) {
      if (req.query.needSchoolInfo) {
        const data = await allRecords("young", hitsRequestBody.query, esClient(), exportFields);
        let schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
        let all = data;

        if (schoolsId.length) {
          const schoolResponse = await allRecords("schoolramses", { bool: { must: { ids: { values: schoolsId } } } });
          const schools = schoolResponse.map((s) => ({ _id: s._id, _source: s }));
          all = data.map((item) => ({ ...item, esSchool: schools.find((e) => e._id === item.schoolId) }));
        }

        response = { ok: true, data: serializeYoungs(all) };
      } else {
        const response = await allRecords("young", hitsRequestBody.query, esClient(), exportFields);
        return res.status(200).send({ ok: true, data: serializeYoungs(response) });
      }
    }

    if (["export", "exportBus"].includes(req.params.action)) {
      return res.status(200).send(response);
    } else {
      const esResponse = await esClient().msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      response = serializeYoungs(esResponse.body);
      return res.status(200).send(response);
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
    const searchFields = ["email.keyword^1", "firstName.folded^2", "lastName.folded^2", "parent1Email.keyword^1", "parent2Email.keyword^1", "zip^1"];
    const filterFields = getYoungsFilters(user);

    const sortFields = ["lastName.keyword", "firstName.keyword", "createdAt"];
    const { youngContextFilters, youngContextError } = await buildYoungContext(user);
    if (youngContextError) {
      return res.status(youngContextError.status).send(youngContextError.body);
    }

    const { error: errorQuery, value: query } = Joi.object({
      tab: Joi.string().trim().valid("volontaire"),
    }).validate(req.query, { stripUnknown: true });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    const contextFilters = [
      ...youngContextFilters,
      query.tab === "volontaire" ? { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST", "DELETED"] } } : null,
    ].filter(Boolean);
    // Body params validation
    const { queryFilters, page, sort, exportFields, error, size } = joiElasticSearch({ filterFields, sortFields, body: body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

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
      const response = await allRecords("young", hitsRequestBody.query, esClient(), exportFields);
      let data = serializeYoungs(response);
      data = await populateYoungExport(data, exportFields);
      return res.status(200).send({ ok: true, data });
    } else {
      const response = await esClient().msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/young-having-school-in-dep-or-region/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip", "parent1Email.keyword", "parent2Email.keyword"];
    const filterFields = getYoungsFilters(user);

    const sortFields = ["lastName.keyword", "firstName.keyword", "createdAt"];

    const { error: errorQuery, value: query } = Joi.object({
      tab: Joi.string().trim().valid("volontaire"),
    }).validate(req.query, { stripUnknown: true });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    const contextFilters = [
      query.tab === "volontaire" ? { terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST"] } } : null,
      user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "schoolDepartment.keyword": user.department } } : null,
      user.role === ROLES.REFERENT_REGION ? { terms: { "schoolRegion.keyword": [user.region] } } : null,
    ].filter(Boolean);

    // Body params validation
    const { queryFilters, page, sort, exportFields, error } = joiElasticSearch({ filterFields, sortFields, body: body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

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
      const response = await allRecords("young", hitsRequestBody.query, esClient(), exportFields);
      let data = serializeYoungs(response);
      //School
      if (exportFields.includes("schoolId")) {
        const schoolIds = [...new Set(data.map((item) => item.schoolId).filter(Boolean))];
        const schools = await allRecords("schoolramses", { bool: { must: { ids: { values: schoolIds } } } });
        data = data.map((item) => ({ ...item, school: schools?.find((e) => e._id.toString() === item.schoolId) }));
      }

      return res.status(200).send({ ok: true, data });
    } else {
      const response = await esClient().msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/propose-mission/:id/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["email.keyword", "firstName.folded", "lastName.folded"];
    const filterFields = ["cohort.keyword", "statusPhase2.keyword", "phase2ApplicationStatus.keyword"];

    const sortFields = [];

    const { youngContextFilters, youngContextError } = await buildYoungContext(user);
    if (youngContextError) {
      return res.status(youngContextError.status).send(youngContextError.body);
    }

    const mission = await MissionObject.findById(req.params.id);
    if (!mission) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // Context filters
    const contextFilters = [
      ...youngContextFilters,
      { terms: { "status.keyword": ["VALIDATED"] } },
      { terms: { "statusPhase1.keyword": ["DONE", "EXEMPTED"] } },
      { terms: { "statusPhase2.keyword": ["IN_PROGRESS", "WAITING_REALISATION"] } },
    ];

    // Body params validation
    const { queryFilters, page, sort, exportFields, error } = joiElasticSearch({ filterFields, sortFields, body: body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size: 12,
    });

    if (mission.location?.lat && mission.location?.lon) {
      hitsRequestBody.sort = { _geo_distance: { location: [mission.location?.lon, mission.location?.lat], order: "asc", unit: "km" } };
    }
    if (req.params.action === "export") {
      const response = await allRecords("young", hitsRequestBody.query, esClient(), exportFields);
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      const response = await esClient().msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/aggregate-status/:action(export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["email", "firstName", "lastName", "city", "zip"];
    const filterFields = [
      "status.keyword",
      "statusPhase1.keyword",
      "region.keyword",
      "department.keyword",
      "academy.keyword",
      "gender.keyword",
      "grade.keyword",
      "handicap.keyword",
      "ppsBeneficiary.keyword",
      "paiBeneficiary.keyword",
      "qpv.keyword",
      "allergies.keyword",
      "specificAmenagment.keyword",
      "reducedMobilityAccess.keyword",
      "cohesionStayMedicalFileReceived.keyword",
      "imageRight.keyword",
      "autoTestPCR.keyword",
      "cohesionStayPresence.keyword",
      "presenceJDM.keyword",
      "departInform.keyword",
      "departSejourMotif.keyword",
    ];
    const sortFields = [];
    if (!canSearchInElasticSearch(user, "young")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    // Context filters
    const contextFilters = [];

    if (user.role === ROLES.HEAD_CENTER) {
      const sessionsPhase1 = await SessionPhase1Object.find({ headCenterId: user._id });
      if (!sessionsPhase1.length) return res.status(200).send({ ok: false, code: ERRORS.NOT_FOUND });
      const visibleCohorts = await getCohortNamesEndAfter(datesub(new Date(), { months: 3 }));
      if (visibleCohorts.length > 0) {
        contextFilters.push({ terms: { "cohort.keyword": visibleCohorts } });
      } else {
        // Tried that to specify when there's just no data or when the head center has no longer access
        return res.status(200).send({ ok: true, data: "no cohort available" });
      }
      contextFilters.push({ terms: { "sessionPhase1Id.keyword": [sessionsPhase1.map((e) => e._id.toString())] } });
    }
    if (user.role === ROLES.REFERENT_REGION) {
      contextFilters.push({ terms: { "region.keyword": [user.region] } });
    }

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      contextFilters.push({ terms: { "department.keyword": user.department } });
    }

    // Body params validation
    const { queryFilters, page, exportFields, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    // Build request body
    const { hitsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort: null,
      contextFilters,
    });

    const response = await allRecords("young", hitsRequestBody.query, esClient(), exportFields);
    const data = aggregateStatus(serializeYoungs(response));
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

function aggregateStatus(youngs) {
  let departments = {};
  for (const young of youngs) {
    if (departments[young.department] === undefined) {
      departments[young.department] = {
        department: young.department,
        region: young.region,
        academy: young.academy,
      };
    }
    if (departments[young.department]["phase1_" + young.statusPhase1] === undefined) {
      departments[young.department]["phase1_" + young.statusPhase1] = 0;
    }
    departments[young.department]["phase1_" + young.statusPhase1]++;

    if (departments[young.department]["phase2_" + young.statusPhase2] === undefined) {
      departments[young.department]["phase2_" + young.statusPhase2] = 0;
    }
    departments[young.department]["phase2_" + young.statusPhase2]++;

    if (departments[young.department]["phase3_" + young.statusPhase3] === undefined) {
      departments[young.department]["phase3_" + young.statusPhase3] = 0;
    }
    departments[young.department]["phase3_" + young.statusPhase3]++;
  }

  return Object.values(departments);
}

module.exports = router;
