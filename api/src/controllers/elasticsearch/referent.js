const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch, department2region, departmentList, COHORTS, ES_NO_LIMIT } = require("snu-lib");
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { buildNdJson, buildRequestBody, joiElasticSearch } = require("./utils");
const StructureObject = require("../../models/structure");
const Joi = require("joi");
const { serializeReferents } = require("../../utils/es-serializer");

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
    const size = body.syze;
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

    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters, size });

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

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["email.keyword", "firstName.folded", "lastName.folded"];
    const filterFields = ["role.keyword", "subRole.keyword", "region.keyword", "department.keyword", "cohorts.keyword"];
    const sortFields = ["lastName.keyword", "firstName.keyword", "createdAt", "lastLoginAt"];
    const size = body.size;

    // Authorization
    if (!canSearchInElasticSearch(user, "referent")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    //Query params validation
    const { error: errorQuery, value: query } = Joi.object({
      cohort: Joi.string()
        .trim()
        .allow(null)
        .valid(...COHORTS),
    }).validate(req.query, { stripUnknown: true });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { referentContextFilters, referentContextError } = await buildReferentContext(user);
    if (referentContextError) {
      return res.status(referentContextError.status).send(referentContextError.body);
    }

    // Context filters
    const contextFilters = [
      ...referentContextFilters,
      query.cohort
        ? {
            bool: {
              should: [
                { bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_DEPARTMENT } }] } },
                { bool: { must: [{ term: { "role.keyword": ROLES.HEAD_CENTER } }, { terms: { "cohorts.keyword": [query.cohort] } }] } },
              ],
            },
          }
        : null,
    ].filter(Boolean);

    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters, size });

    if (req.params.action === "export") {
      const response = await allRecords("referent", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: serializeReferents(response) });
    } else {
      const response = await esClient.msearch({ index: "referent", body: buildNdJson({ index: "referent", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeReferents(response.body));
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/structure/:structure", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canSearchInElasticSearch(req.user, "referent")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const response = await esClient.msearch({
      index: "referent",
      body: buildNdJson(
        { index: "referent", type: "_doc" },
        {
          query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": req.params.structure } }] } },
          size: ES_NO_LIMIT,
        },
      ),
    });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
