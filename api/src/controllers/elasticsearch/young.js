const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody } = require("./utils");

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

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
      if (!sessionPhase1.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      contextFilters.push(
        { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } },
        { terms: { "sessionPhase1Id.keyword": sessionPhase1.map((sessionPhase1) => sessionPhase1._id.toString()) } },
      );
      const visibleCohorts = await getCohortNamesEndAfter(datesub(new Date(), { months: 3 }));
      if (visibleCohorts.length > 0) {
        contextFilters.push({ terms: { "cohort.keyword": visibleCohorts } });
      } else {
        // Tried that to specify when there's just no data or when the head center has no longer access
        return res.status(404).send({ ok: true, data: "no cohort available" });
      }
    }
    // A responsible can only see youngs in application of their structure.
    if (user.role === ROLES.RESPONSIBLE) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const applications = await ApplicationObject.find({ structureId: user.structureId });
      contextFilters.push({ terms: { _id: applications.map((e) => e.youngId) } });
    }

    // A supervisor can only see youngs in application of their structures.
    if (user.role === ROLES.SUPERVISOR) {
      if (!user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const structures = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
      const applications = await ApplicationObject.find({ structureId: { $in: structures.map((e) => e._id.toString()) } });
      contextFilters.push({ terms: { _id: applications.map((e) => e.youngId) } });
    }

    if (user.role === ROLES.REFERENT_REGION) {
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

    if (user.role === ROLES.REFERENT_DEPARTMENT) {
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

    // Visitors can only get aggregations and is limited to its region.
    if (user.role === ROLES.VISITOR) {
      contextFilters.push({ term: { "region.keyword": user.region } });
      body.size = 0;
    }

    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields: ["lastName", "firstName", "email", "city"],
      filterFields: ["department.keyword", "region.keyword", "cohort.keyword", "grade.keyword"],
      queryFilters: body.filters,
      page: body.page,
      sort: body.sort,
      contextFilters,
    });
    if (req.params.action === "export") {
      const response = await allRecords("young", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "young", body: buildNdJson({ index: "young", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
