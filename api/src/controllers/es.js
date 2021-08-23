const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES } = require("snu-lib/roles");
const { capture } = require("../sentry");
const esClient = require("../es");
const { ERRORS, isYoung } = require("../utils");
const StructureObject = require("../models/structure");
const ApplicationObject = require("../models/application");
const CohesionCenterObject = require("../models/cohesionCenter");

// Routes accessible for youngs and referent
router.post("/mission/_msearch", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
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
    if (user.role === ROLES.HEAD_CENTER) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const response = await esClient.msearch({ index: "mission", body: withFilter(body, filter) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

// Routes accessible by young only
router.post("/missionapi/_msearch", passport.authenticate(["young"], { session: false }), async (req, res) => {
  try {
    const { body } = req;
    const response = await esClient.msearch({ index: "missionapi", body });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

router.post("/school/_msearch", passport.authenticate(["young"], { session: false }), async (req, res) => {
  try {
    const { body } = req;
    const response = await esClient.msearch({ index: "school", body });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

// Routes accessible by referents only
router.post("/young/_msearch", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { user, body } = req;
    if (user.role === ROLES.ADMIN) {
      const response = await esClient.msearch({ index: "young", body });
      return res.status(200).send(response.body);
    }
    const filter = [
      { terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST"] } },
    ];

    // A head center can only see youngs of their cohesion center.
    if (user.role === ROLES.HEAD_CENTER) {
      const center = await CohesionCenterObject.findById(user.cohesionCenterId);
      if (!center) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      filter.push({ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } }, { term: { "cohesionCenterId.keyword": center._id.toString() } });
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

    const response = await esClient.msearch({ index: "young", body: withFilter(body, filter) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error: error.message });
  }
});

// cohesionyoung is a special index, so we need to use the index "young" and specify a center ID.
router.post("/cohesionyoung/:id/_msearch", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { user, body } = req;

    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].includes(user.role)) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    if (user.role === ROLES.REFERENT_REGION) {
      const centers = await CohesionCenterObject.find({ region: user.region });
      if (!centers.map((e) => e._id.toString()).includes(req.params.id)) {
        return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
    }

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      const centers = await CohesionCenterObject.find({ department: user.department });
      if (!centers.map((e) => e._id.toString()).includes(req.params.id)) {
        return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
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

    const response = await esClient.msearch({
      index: "young",
      body: withFilter(body, filter),
    });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});
router.post("/structure/_msearch", passport.authenticate(["referent"], { session: false }), async (req, res) => {
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
    if (user.role === ROLES.HEAD_CENTER) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const response = await esClient.msearch({ index: "structure", body: withFilter(body, filter) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});
router.post("/referent/_msearch", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];

    // A responsible cans only see their structure's referent (responsible and supervisor).
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const structure = await StructureObject.findById(user.structureId);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      filter.push({ terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
      filter.push({ terms: { "structureId.keyword": [user.structureId, structure.networkId] } });
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
            { terms: { "role.keyword": [ROLES.REFERENT_DEPARTMENT] } },
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
            { terms: { "role.keyword": [ROLES.REFERENT_REGION] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_DEPARTMENT } }, { term: { "region.keyword": user.region } }] } },
            { bool: { must: [{ term: { "role.keyword": ROLES.HEAD_CENTER } }, { term: { "region.keyword": user.region } }] } },
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

    const response = await esClient.msearch({ index: "referent", body: withFilter(body, filter) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

router.post("/application/_msearch", passport.authenticate(["referent"], { session: false }), async (req, res) => {
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
    if (user.role === ROLES.HEAD_CENTER) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const response = await esClient.msearch({ index: "application", body: withFilter(body, filter) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});
router.post("/cohesioncenter/_msearch", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { user, body } = req;
    let filter = [];

    if (user.role === ROLES.REFERENT_REGION) filter.push({ term: { "region.keyword": user.region } });
    if (user.role === ROLES.REFERENT_DEPARTMENT) filter.push({ term: { "department.keyword": user.department } });

    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].includes(user.role)) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const response = await esClient.msearch({ index: "cohesioncenter", body: withFilter(body, filter) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

router.post("/meetingpoint/_msearch", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { user, body } = req;

    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].includes(user.role)) {
      return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const response = await esClient.msearch({ index: "meetingpoint", body });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

// Add filter to all lines of the body.
function withFilter(body, filter) {
  return (
    body
      .split(`\n`)
      .filter((e) => e)
      .map((item, key) => {
        // Declaration line are skipped.
        if (key % 2 === 0) return item;

        const q = JSON.parse(item);
        if (!q.query.bool) {
          if (q.query.match_all) {
            q.query = { bool: { must: { match_all: {} } } };
          } else {
            const tq = q.query;
            delete q.query;
            q.query = { bool: { must: tq } };
          }
        }

        if (q.query.bool.filter) q.query.bool.filter = [...q.query.bool.filter, ...filter];
        else q.query.bool.filter = filter;

        return JSON.stringify(q);
      })
      .join(`\n`) + `\n`
  );
}

module.exports = router;
