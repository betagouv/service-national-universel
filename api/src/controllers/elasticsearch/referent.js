const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch } = require("snu-lib/roles");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("./utils");
const StructureObject = require("../../models/structure");
const { department2region, departmentList, regionList } = require("snu-lib");
const Joi = require("joi");

async function buildReferentContext(user) {
  const contextFilters = [];

  // A responsible cans only see their structure's referent (responsible and supervisor).
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { referentContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const structure = await StructureObject.findById(user.structureId);
    if (!structure) return { referentContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
    const structureIdKeyword = [user.structureId];
    if (structure.networkId) structureIdKeyword.push(structure.networkId);
    contextFilters.push({ terms: { "structureId.keyword": structureIdKeyword } });
  }

  // A supervisor can only see their structures' referent (responsible and supervisor).
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { referentContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    contextFilters.push({ terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
    contextFilters.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
  }

  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    contextFilters.push({
      bool: {
        should: [
          { terms: { "role.keyword": [ROLES.REFERENT_DEPARTMENT, ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER, ROLES.REFERENT_REGION] } },
          { bool: { must: [{ term: { "role.keyword": ROLES.HEAD_CENTER } }, { terms: { "department.keyword": user.department } }] } },
        ],
      },
    });
  }
  if (user.role === ROLES.REFERENT_REGION) {
    contextFilters.push({
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
    contextFilters.push({
      bool: {
        must: [{ terms: { "role.keyword": [ROLES.HEAD_CENTER, ROLES.REFERENT_DEPARTMENT] } }],
      },
    });
  }

  return { referentContextFilters: contextFilters };
}

router.post("/team/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["email", "firstName", "lastName"];
    const filterFields = ["role.keyword", "subRole.keyword", "region.keyword", "department.keyword"];
    const sortFields = [];

    // Authorization
    if (!canSearchInElasticSearch(user, "referent")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    //Query params validation
    const { error: errorQuery, value: query } = Joi.object({
      tab: Joi.string()
        .trim()
        .allow(null)
        .valid("region", "department", ...departmentList),
    }).validate(req.query, { stripUnknown: true });
    console.log(errorQuery);
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    const contextFilters = [
      user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "region.keyword": user.department.map((depart) => department2region[depart]) } } : null,
      user.role === ROLES.REFERENT_REGION ? { terms: { "region.keyword": [user.region] } } : null,
    ].filter(Boolean);

    if (query.tab) {
      if (query.tab === "region") {
        contextFilters.push({ terms: { "role.keyword": [ROLES.REFERENT_REGION, ROLES.VISITOR] } });
      } else {
        contextFilters.push({ terms: { "role.keyword": [ROLES.REFERENT_DEPARTMENT] } });
      }
    }

    console.log("contextFilters", JSON.stringify(contextFilters));

    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters });

    if (req.params.action === "export") {
      const response = await allRecords("referent", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({ index: "referent", body: buildNdJson({ index: "referent", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
