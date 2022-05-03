const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchAssociation, canSearchSessionPhase1, canSearchMeetingPoints } = require("snu-lib/roles");
const { PHASE1_HEADCENTER_ACCESS_LIMIT, COHORTS } = require("snu-lib/constants");
const { region2department } = require("snu-lib/region-and-departments");
const { capture } = require("../sentry");
const esClient = require("../es");
const { ERRORS, isYoung, getSignedUrlForApiAssociation } = require("../utils");
const StructureObject = require("../models/structure");
const ApplicationObject = require("../models/application");
const CohesionCenterObject = require("../models/cohesionCenter");
const SessionPhase1Object = require("../models/sessionPhase1");
const { serializeMissions, serializeSchools, serializeYoungs, serializeStructures, serializeReferents, serializeApplications, serializeHits } = require("../utils/es-serializer");
const { allRecords } = require("../es/utils");
const { API_ASSOCIATION_ES_ENDPOINT } = require("../config");
const Joi = require("joi");

// Routes accessible for youngs and referent
router.post("/mission/:action(_msearch|export)", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    const filter = [];

    // A young can only see validated missions.
    if (isYoung(user)) filter.push({ term: { "status.keyword": "VALIDATED" } });

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

    // A head center can not see missions.
    if (user.role === ROLES.HEAD_CENTER) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("mission", applyFilterOnQuery(req.body.query, filter));
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
router.post("/missionapi/_msearch", passport.authenticate(["young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { body } = req;
    const response = await esClient.msearch({ index: "missionapi", body });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/school/_msearch", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { body } = req;
    const response = await esClient.msearch({ index: "school", body });
    return res.status(200).send(serializeSchools(response.body));
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Routes accessible by referents only
router.post("/young/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    if (user.role === ROLES.ADMIN) {
      if (req.params.action === "export") {
        const response = await allRecords("young", req.body.query);
        return res.status(200).send({ ok: true, data: response });
      } else {
        const response = await esClient.msearch({ index: "young", body });
        return res.status(200).send(response.body);
      }
    }
    const filter = [{ terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST", "ABANDONED"] } }];

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
      const visibleCohorts = COHORTS.filter((cohort) => PHASE1_HEADCENTER_ACCESS_LIMIT[cohort] > Date.now());
      if (visibleCohorts.length) {
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

    if (user.role === ROLES.REFERENT_REGION) filter.push({ term: { "region.keyword": user.region } });
    if (user.role === ROLES.REFERENT_DEPARTMENT) filter.push({ term: { "department.keyword": user.department } });

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
router.post("/young-having-school-in-department/:view/export", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const keys = ["volontaires", "inscriptions"];
    const { error: viewError, value: view } = Joi.string()
      .required()
      .valid(...keys)
      .validate(req.params.view);
    if (viewError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { user, body } = req;
    if (user.role !== ROLES.REFERENT_DEPARTMENT) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const filter = [{ term: { "schoolDepartment.keyword": user.department } }];

    if (view === "volontaires") {
      filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST"] } });
    }

    const response = await allRecords("young", applyFilterOnQuery(body.query, filter));
    return res.status(200).send({ ok: true, data: serializeYoungs(response) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});
// young-having-school-in-region is a special index (that uses a young index)
// used by REFERENT_REGION to get youngs having a school in their region.
router.post("/young-having-school-in-region/:view/export", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const keys = ["volontaires", "inscriptions"];
    const { error: viewError, value: view } = Joi.string()
      .required()
      .valid(...keys)
      .validate(req.params.view);
    if (viewError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { user, body } = req;
    if (user.role !== ROLES.REFERENT_REGION) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const filter = [{ terms: { "schoolDepartment.keyword": [...region2department[user.region]] } }];

    if (view === "volontaires") {
      filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST"] } });
    }

    const response = await allRecords("young", applyFilterOnQuery(body.query, filter));
    return res.status(200).send({ ok: true, data: serializeYoungs(response) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// cohesionyoung is a special index, so we need to use the index "young" and specify a center ID.
router.post("/cohesionyoung/:id/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].includes(user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (user.role === ROLES.REFERENT_REGION) {
      const centers = await CohesionCenterObject.find({ region: user.region });
      if (!centers.map((e) => e._id.toString()).includes(req.params.id)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      const centers = await CohesionCenterObject.find({ department: user.department });
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

    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

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
      const visibleCohorts = COHORTS.filter((cohort) => PHASE1_HEADCENTER_ACCESS_LIMIT[cohort] > Date.now());
      if (visibleCohorts.length) {
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

    // A responsible can only see their structure and parent structure (not sure why we need ES though).
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const structure = await StructureObject.findById(user.structureId);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const parent = await StructureObject.findById(structure.networkId);

      filter.push({ terms: { _id: [structure._id.toString(), parent?._id?.toString()].filter((e) => e) } });
    }

    // A supervisor can only see their structures (all network).
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      filter.push({ terms: { _id: data.map((e) => e._id.toString()) } });
    }

    // A head center can not see missions.
    if (user.role === ROLES.HEAD_CENTER) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("structure", applyFilterOnQuery(req.body.query, filter));
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
            { terms: { "role.keyword": [ROLES.REFERENT_DEPARTMENT, ROLES.SUPERVISOR, ROLES.RESPONSIBLE] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_REGION } }, { term: { "region.keyword": user.region } }] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.HEAD_CENTER } }, { term: { "department.keyword": user.department } }] } },
          ],
        },
      });
    }
    if (user.role === ROLES.REFERENT_REGION) {
      filter.push({
        bool: {
          should: [
            { terms: { "role.keyword": [ROLES.REFERENT_REGION, ROLES.SUPERVISOR, ROLES.RESPONSIBLE] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_DEPARTMENT } }, { term: { "region.keyword": user.region } }] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.HEAD_CENTER } }, { term: { "region.keyword": user.region } }] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.VISITOR } }, { term: { "region.keyword": user.region } }] } },
          ],
        },
      });
    }
    if (user.role === ROLES.HEAD_CENTER) {
      filter.push({
        bool: {
          must: [{ terms: { "role.keyword": [ROLES.HEAD_CENTER] } }],
        },
      });
    }
    if (user.role === ROLES.VISITOR) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
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

    // A responsible cans only see their structure's applications.
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      filter.push({ terms: { "structureId.keyword": [user.structureId] } });
    }

    // A supervisor can only see their structures' applications.
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      filter.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
    }

    // A head center can not see applications.
    if (user.role === ROLES.HEAD_CENTER) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("application", applyFilterOnQuery(req.body.query, filter));
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

    if (user.role === ROLES.REFERENT_REGION) filter.push({ term: { "region.keyword": user.region } });
    if (user.role === ROLES.REFERENT_DEPARTMENT) filter.push({ term: { "department.keyword": user.department } });

    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].includes(user.role)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

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

router.post("/meetingpoint/:action(_msearch|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

    if (!canSearchMeetingPoints(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const response = await allRecords("meetingpoint", req.body.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "meetingpoint", body: body });
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

    filter.push({
      bool: {
        filter: [{ bool: { must: [{ term: { "region.keyword": user.region } }] } }],
      },
    });

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

// Add filter to all lines of the body.
function withFilterForMSearch(body, filter) {
  return (
    body
      .split(`\n`)
      .filter((e) => e)
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

  if (query.bool.filter) query.bool.filter = [...query.bool.filter, ...filter];
  else query.bool.filter = filter;

  return query;
}

module.exports = router;
