const passport = require("passport");
const express = require("express");
const router = express.Router();
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
const { capture } = require("../Services/sentry");
const esClient = require("../Databases/ElasticSearch");
const { ERRORS, isYoung, getSignedUrlForApiAssociation, isReferent } = require("../../Application/Utils");
const StructureObject = require("../Databases/Mongo/Models/structure");
const ApplicationObject = require("../Databases/Mongo/Models/application");
const CohesionCenterObject = require("../Databases/Mongo/Models/cohesionCenter");
const SessionPhase1Object = require("../Databases/Mongo/Models/sessionPhase1");
const {
  serializeMissions,
  serializeSchools,
  serializeRamsesSchools,
  serializeYoungs,
  serializeStructures,
  serializeReferents,
  serializeApplications,
  serializeHits,
} = require("../Databases/ElasticSearch/es-serializer");
const { allRecords } = require("../Databases/ElasticSearch/utils");
const { API_ASSOCIATION_ES_ENDPOINT } = require("../Config/config");
const Joi = require("joi");
const datesub = require("date-fns/sub");
const { getCohortNamesEndAfter } = require("../../Application/Utils/cohort");

// Routes accessible for youngs and referent
router.post("/mission/:action(_msearch|export)", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    const filter = [];

    // A young can only see validated missions.
    if (isYoung(user)) filter.push({ term: { "status.keyword": "VALIDATED" } });
    if (isReferent(user) && !canSearchInElasticSearch(user, "mission")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // A responsible cans only see their structure's missions.
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      filter.push({ terms: { "structureId.keyword": [user.structureId] } });
    }

    // A supervisor can only see their structures' missions.
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      // const data = await StructureObject.find({ networkId: user.structureId });
      filter.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
    }

    if (req.params.action === "export") {
      const response = await allRecords("mission", applyFilterOnQuery(req.body.query, filter), esClient, body.fieldsToExport);
      return res.status(200).send({ ok: true, data: serializeMissions(response) });
    } else {
      const response = await esClient.msearch({ index: "mission", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeMissions(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Routes accessible by young only
router.post("/school/_msearch", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { body, user } = req;
    if (isReferent(user) && !canSearchInElasticSearch(user, "school")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const response = await esClient.msearch({ index: "school", body });
    return res.status(200).send(serializeSchools(response.body));
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/schoolramses/_msearch", async (req, res) => {
  try {
    const { body } = req;
    const response = await esClient.msearch({ index: "schoolramses", body });
    return res.status(200).send(serializeRamsesSchools(response.body));
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/schoolramses-limited-roles/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    const filter = [];

    if (user.role === ROLES.REFERENT_REGION) filter.push({ term: { "region.keyword": user.region } });
    if (user.role === ROLES.REFERENT_DEPARTMENT) filter.push({ terms: { "departmentName.keyword": user.department } });

    if (req.params.action === "export") {
      const response = await allRecords("schoolramses", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "schoolramses", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeYoungs(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Routes accessible by referents only
router.post("/young/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  // uses for listing youngs for bus lines and assembling points (referents need to access to youngs assinged to their region or department)
  const { showAffectedToRegionOrDep } = req.query;
  try {
    const { user, body } = req;
    if (user.role === ROLES.ADMIN) {
      if (req.params.action === "export") {
        const response = await allRecords("young", body.query, esClient, body.fieldsToExport);
        return res.status(200).send({ ok: true, data: response });
      } else {
        const response = await esClient.msearch({ index: "young", body });
        return res.status(200).send(response.body);
      }
    }
    const filter = [
      { terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST", "ABANDONED", "REINSCRIPTION"] } },
    ];

    // Open in progress inscription to referent
    if (user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) filter[0].terms["status.keyword"].push("IN_PROGRESS");

    // A head center can only see youngs of their session.
    if (user.role === ROLES.HEAD_CENTER) {
      const sessionPhase1 = await SessionPhase1Object.find({ headCenterId: user._id });
      if (!sessionPhase1.length) return res.status(200).send({ ok: false, code: ERRORS.NOT_FOUND });
      filter.push(
        { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } },
        { terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } },
      );
      const visibleCohorts = await getCohortNamesEndAfter(datesub(new Date(), { months: 3 }));
      if (visibleCohorts.length > 0) {
        filter.push({ terms: { "cohort.keyword": visibleCohorts } });
      } else {
        // Tried that to specify when there's just no data or when the head center has no longer access
        return res.status(200).send({ ok: true, data: "no cohort available" });
      }
    }
    // A responsible can only see youngs in application of their structure.
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const applications = await ApplicationObject.find({ structureId: user.structureId });
      filter.push({ terms: { _id: applications.map((e) => e.youngId) } });
    }

    // A supervisor can only see youngs in application of their structures.
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const structures = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      const applications = await ApplicationObject.find({ structureId: { $in: structures.map((e) => e._id.toString()) } });
      filter.push({ terms: { _id: applications.map((e) => e.youngId) } });
    }

    if (user.role === ROLES.REFERENT_REGION && !showAffectedToRegionOrDep) {
      filter.push({ term: { "region.keyword": user.region } });
    }

    // if (user.role === ROLES.REFERENT_REGION && showAffectedToRegionOrDep) {
    //   const sessionPhase1 = await SessionPhase1Object.find({ region: user.region });
    //   if (sessionPhase1.length === 0) {
    //     filter.push({ term: { "region.keyword": user.region } });
    //   } else {
    //     filter.push({
    //       bool: {
    //         should: [{ terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } }, { term: { "region.keyword": user.region } }],
    //       },
    //     });
    //   }
    // }

    if (user.role === ROLES.REFERENT_DEPARTMENT && !showAffectedToRegionOrDep) {
      filter.push({ terms: { "department.keyword": user.department } });
    }

    // if (user.role === ROLES.REFERENT_DEPARTMENT && showAffectedToRegionOrDep) {
    //   const sessionPhase1 = await SessionPhase1Object.find({ department: { $in: user.department } });
    //   if (sessionPhase1.length === 0) {
    //     filter.push({ terms: { "department.keyword": user.department } });
    //   } else {
    //     filter.push({
    //       bool: {
    //         should: [
    //           { terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } },
    //           { terms: { "department.keyword": user.department } },
    //         ],
    //       },
    //     });
    //   }
    // }

    // Visitors can only get aggregations and is limited to its region.
    if (user.role === ROLES.VISITOR) {
      filter.push({ term: { "region.keyword": user.region } });
      body.size = 0;
    }

    if (req.params.action === "export") {
      const response = await allRecords("young", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      const response = await esClient.msearch({ index: "young", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeYoungs(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// young-having-school-in-department is a special index (that uses a young index)
// used by REFERENT_DEPARTMENT to get youngs having a school in their department.
router.post("/young-having-school-in-department/:view/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const keys = ["volontaires", "inscriptions"];
    const { error: viewError, value: view } = Joi.string()
      .required()
      .valid(...keys)
      .validate(req.params.view);
    if (viewError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { user, body } = req;

    if (!canSearchInElasticSearch(user, "young-having-school-in-department")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filter = [{ terms: { "schoolDepartment.keyword": user.department } }];

    if (view === "volontaires") {
      filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST"] } });
    }

    if (req.params.action === "export") {
      const response = await allRecords("young", applyFilterOnQuery(body.query, filter));
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      const response = await esClient.msearch({ index: "young", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeYoungs(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// young-having-school-in-region is a special index (that uses a young index)
// used by REFERENT_REGION to get youngs having a school in their region.
router.post("/young-having-school-in-region/:view/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const keys = ["volontaires", "inscriptions"];
    const { error: viewError, value: view } = Joi.string()
      .required()
      .valid(...keys)
      .validate(req.params.view);
    if (viewError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { user, body } = req;

    if (!canSearchInElasticSearch(user, "young-having-school-in-region")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const filter = [{ terms: { "schoolRegion.keyword": [user.region] } }];

    if (view === "volontaires") {
      filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST"] } });
    }

    if (req.params.action === "export") {
      const response = await allRecords("young", applyFilterOnQuery(body.query, filter));
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      console.log(withFilterForMSearch(body, filter));
      const response = await esClient.msearch({ index: "young", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeYoungs(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// cohesionyoung is a special index, so we need to use the index "young" and specify a center ID.
router.post("/cohesionyoung/:id/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

    if (!canSearchInElasticSearch(user, "cohesionyoung")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (user.role === ROLES.REFERENT_REGION) {
      const centers = await CohesionCenterObject.find({ region: user.region });
      if (!centers.map((e) => e._id.toString()).includes(req.params.id)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      const centers = await CohesionCenterObject.find({ department: { $in: user.department } });
      if (!centers.map((e) => e._id.toString()).includes(req.params.id)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    const filter = [
      {
        bool: {
          filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } }, { term: { cohesionCenterId: req.params.id } }],
          must_not: [{ term: { "statusPhase1.keyword": "WAITING_LIST" } }],
        },
      },
    ];

    if (req.params.action === "export") {
      const response = await allRecords("young", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      const response = await esClient.msearch({ index: "young", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeYoungs(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/sessionphase1young/:id/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

    if (!canSearchInElasticSearch(user, "sessionphase1young")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let filter = [
      {
        bool: {
          filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } }, { term: { sessionPhase1Id: req.params.id } }],
          must_not: [{ term: { "statusPhase1.keyword": "WAITING_LIST" } }],
        },
      },
    ];

    if (user.role === ROLES.HEAD_CENTER) {
      const sessionsPhase1 = await SessionPhase1Object.find({ headCenterId: user._id });
      if (!sessionsPhase1.length) return res.status(200).send({ ok: false, code: ERRORS.NOT_FOUND });
      const visibleCohorts = await getCohortNamesEndAfter(datesub(new Date(), { months: 3 }));
      if (visibleCohorts.length > 0) {
        filter.push({ terms: { "cohort.keyword": visibleCohorts } });
      } else {
        // Tried that to specify when there's just no data or when the head center has no longer access
        return res.status(200).send({ ok: true, data: "no cohort available" });
      }
      if (!sessionsPhase1.map((e) => e._id.toString()).includes(req.params.id)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }
    if (user.role === ROLES.REFERENT_REGION) {
      const centers = await CohesionCenterObject.find({ region: user.region });
      const sessionsPhase1 = await SessionPhase1Object.find({ cohesionCenterId: { $in: centers.map((e) => e._id.toString()) } });
      if (!sessionsPhase1.map((e) => e._id.toString()).includes(req.params.id)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      const centers = await CohesionCenterObject.find({ department: user.department });
      const sessionsPhase1 = await SessionPhase1Object.find({ cohesionCenterId: { $in: centers.map((e) => e._id.toString()) } });
      if (!sessionsPhase1.map((e) => e._id.toString()).includes(req.params.id)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    if (req.params.action === "export") {
      const response = await allRecords("young", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: serializeYoungs(response) });
    } else {
      const response = await esClient.msearch({ index: "young", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeYoungs(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/structure/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { body, user } = req;
    const filter = [];

    if (!canSearchInElasticSearch(user, "structure")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // A responsible can only see their structure and parent structure (not sure why we need ES though).
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const structure = await StructureObject.findById(user.structureId);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      let idsArray = [structure._id.toString()];
      if (structure.networkId !== "") {
        const parent = await StructureObject.findById(structure.networkId);
        idsArray.push(parent?._id?.toString());
      }
      filter.push({ terms: { _id: idsArray.filter((e) => e) } });
    }

    // A supervisor can only see their structures (all network).
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      filter.push({ terms: { _id: data.map((e) => e._id.toString()) } });
    }

    if (req.params.action === "export") {
      const response = await allRecords("structure", applyFilterOnQuery(req.body.query, filter), esClient, body.fieldsToExport);
      return res.status(200).send({ ok: true, data: serializeStructures(response) });
    } else {
      const response = await esClient.msearch({ index: "structure", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeStructures(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.post("/referent/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];

    if (!canSearchInElasticSearch(user, "referent")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // A responsible cans only see their structure's referent (responsible and supervisor).
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const structure = await StructureObject.findById(user.structureId);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      filter.push({ terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
      const structureIdKeyword = [user.structureId];
      if (structure.networkId) structureIdKeyword.push(structure.networkId);
      filter.push({ terms: { "structureId.keyword": structureIdKeyword } });
    }

    // A supervisor can only see their structures' referent (responsible and supervisor).
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      filter.push({ terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
      filter.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
    }

    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      filter.push({
        bool: {
          should: [
            { terms: { "role.keyword": [ROLES.REFERENT_DEPARTMENT, ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER, ROLES.REFERENT_REGION] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.HEAD_CENTER } }, { terms: { "department.keyword": user.department } }] } },
          ],
        },
      });
    }
    if (user.role === ROLES.REFERENT_REGION) {
      filter.push({
        bool: {
          should: [
            { terms: { "role.keyword": [ROLES.REFERENT_REGION, ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_DEPARTMENT } }, { term: { "region.keyword": user.region } }] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.VISITOR } }, { term: { "region.keyword": user.region } }] } },
          ],
        },
      });
    }
    if (user.role === ROLES.HEAD_CENTER) {
      filter.push({
        bool: {
          must: [{ terms: { "role.keyword": [ROLES.HEAD_CENTER, ROLES.REFERENT_DEPARTMENT] } }],
        },
      });
    }

    if (req.params.action === "export") {
      const response = await allRecords("referent", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: serializeReferents(response) });
    } else {
      const response = await esClient.msearch({ index: "referent", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeReferents(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/application/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    const filter = [];

    if (!canSearchInElasticSearch(user, "application")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // A responsible can only see their structure's applications.
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      filter.push({ terms: { "structureId.keyword": [user.structureId] } });
      filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"] } });
    }

    // A supervisor can only see their structures' applications.
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      filter.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
      filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"] } });
    }

    if (req.params.action === "export") {
      const response = await allRecords("application", applyFilterOnQuery(req.body.query, filter), esClient, body.fieldsToExport);
      return res.status(200).send({ ok: true, data: serializeApplications(response) });
    } else {
      const response = await esClient.msearch({ index: "application", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeApplications(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/cohesioncenter/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];

    if (!canSearchInElasticSearch(user, "cohesioncenter")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (user.role === ROLES.REFERENT_REGION) filter.push({ term: { "region.keyword": user.region } });
    if (user.role === ROLES.REFERENT_DEPARTMENT) filter.push({ terms: { "department.keyword": user.department } });

    if (req.params.action === "export") {
      const response = await allRecords("cohesioncenter", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "cohesioncenter", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/edit-cohesioncenter/_msearch", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];

    if (!canSearchInElasticSearch(user, "cohesioncenter")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const response = await esClient.msearch({ index: "cohesioncenter", body: withFilterForMSearch(body, filter) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/sessionphase1/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];

    if (!canSearchSessionPhase1(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("sessionphase1", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "sessionphase1", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/pointderassemblement/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];
    filter.push({
      bool: {
        must_not: {
          exists: {
            field: "deletedAt",
          },
        },
      },
    });

    if (!canSearchMeetingPoints(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("pointderassemblement", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "pointderassemblement", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/lignebus/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];
    filter.push({
      bool: {
        must_not: {
          exists: {
            field: "deletedAt",
          },
        },
      },
    });

    if (!canSearchLigneBus(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("lignebus", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "lignebus", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/plandetransport/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];
    filter.push({
      bool: {
        must_not: {
          exists: {
            field: "deletedAt",
          },
        },
      },
    });

    if (!canSearchLigneBus(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("plandetransport", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "plandetransport", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/bus/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];
    filter.push({
      bool: {
        must_not: {
          exists: {
            field: "deletedAt",
          },
        },
      },
    });

    if (!canViewBus(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("meetingpoint", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "bus", body: body });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/email/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

    if (!canViewEmailHistory(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let filter = [];

    if (user.role !== ROLES.ADMIN) {
      filter.push({ term: { "event.keyword": "delivered" } });
    }

    if (req.params.action === "export") {
      const response = await allRecords("email", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "email", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/association/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { body } = req;
    const options = {
      node: `https://${API_ASSOCIATION_ES_ENDPOINT}`,
    };
    const es = new (require("@elastic/elasticsearch").Client)(options);

    if (!canSearchAssociation(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const serializeResponse = (response) => {
      return serializeHits(response, (hit) => {
        if (hit.logo) hit.logo = hit.logo && !hit.logo.startsWith("http") ? getSignedUrlForApiAssociation(hit.logo) : hit.logo;
        return hit;
      });
    };

    if (req.params.action === "export") {
      const response = await allRecords("association", req.body.query, es);
      return res.status(200).send({
        ok: true,
        data: serializeResponse(response),
      });
    } else {
      let { body: response } = await es.msearch({ index: "association", body });
      return res.status(200).send(serializeResponse(response));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/team/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];

    if (!canSearchInElasticSearch(user, "team")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      filter.push({
        bool: {
          filter: [{ bool: { must: [{ terms: { "region.keyword": user.department.map((depart) => department2region[depart]) } }] } }],
        },
      });
    } else {
      filter.push({
        bool: {
          filter: [{ bool: { must: [{ term: { "region.keyword": user.region } }] } }],
        },
      });
    }

    if (req.params.action === "export") {
      const response = await allRecords("referent", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: serializeReferents(response) });
    } else {
      const response = await esClient.msearch({ index: "referent", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeReferents(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/modificationbus/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];

    if (!canSearchInElasticSearch(user, "modificationbus")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("modificationbus", applyFilterOnQuery(req.body.query, filter));
      return res.status(200).send({ ok: true, data: serializeReferents(response) });
    } else {
      const response = await esClient.msearch({ index: "modificationbus", body: withFilterForMSearch(body, filter) });
      return res.status(200).send(serializeReferents(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
router.post("/inscriptiongoal/_msearch", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { body, user } = req;
    if (!isReferent(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const response = await esClient.msearch({ index: "inscriptiongoal", body });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Add filter to all lines of the body.
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

module.exports = router;
