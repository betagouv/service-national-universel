const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES } = require("snu-lib/roles");
const { capture } = require("../sentry");
const esClient = require("../es");
const { ERRORS, isYoung } = require("../utils");
const StructureObject = require("../models/structure");

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
    if (user.role === ROLES.REFERENT_REGION) filter.push({ term: { "region.keyword": user.region } });
    if (user.role === ROLES.REFERENT_DEPARTMENT) filter.push({ term: { "department.keyword": user.department } });
    const response = await esClient.msearch({ index: "young", body: withFilter(body, filter) });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error });
  }
});

router.post("/cohesionyoung/_msearch", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  // cohesionyoung is a special index, so we need to use the index "young".
  // Todo: fix this route that is not well implemented (verification is done in frontend).
  // We have to ceck who can see center on front end.
  try {
    const { user, body } = req;
    if (user.role === ROLES.ADMIN) {
      const response = await esClient.msearch({ index: "young", body });
      return res.status(200).send(response.body);
    }
    const response = await esClient.msearch({
      index: "young",
      body: withFilter(body, [
        { terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED", "WITHDRAWN", "WAITING_LIST"] } },
      ]),
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

      filter.push({ terms: { "structureId.keyword": [structure._id.toString(), parent?._id?.toString()].filter((e) => e) } });
    }

    // A supervisor can only see their structures (all network).
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      filter.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
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

    if (user.role === ROLES.RESPONSIBLE) filter.push({ terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });

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
      // const data = await StructureObject.find({ networkId: user.structureId });
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
