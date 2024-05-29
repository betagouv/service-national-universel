const passport = require("passport");
const express = require("express");
const router = express.Router();
const { ROLES, canSearchInElasticSearch, ES_NO_LIMIT } = require("snu-lib");
const { capture } = require("../../sentry");
const { esClient } = require("../../es");
const { ERRORS } = require("../../utils");
const { allRecords } = require("../../es/utils");
const { joiElasticSearch, buildNdJson, buildRequestBody } = require("./utils");
const StructureObject = require("../../models/structure");

async function buildStructureContext(user) {
  const contextFilters = [];

  // A responsible can only see their structure and parent structure (not sure why we need ES though).
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { structureContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const structure = await StructureObject.findById(user.structureId);
    if (!structure) return { structureContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    let idsArray = [structure._id.toString()];
    if (structure.networkId !== "") {
      const parent = await StructureObject.findById(structure.networkId);
      idsArray.push(parent?._id?.toString());
    }
    contextFilters.push({ terms: { _id: idsArray.filter((e) => e) } });
  }

  // A supervisor can only see their structures (all network).
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { structureContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const data = await StructureObject.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    contextFilters.push({ terms: { _id: data.map((e) => e._id.toString()) } });
  }

  return { structureContextFilters: contextFilters };
}

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation", "siret", "networkName"];
    const filterFields = [
      "department.keyword",
      "region.keyword",
      "legalStatus.keyword",
      "types.keyword",
      "sousType.keyword",
      "networkName.keyword",
      "isMilitaryPreparation.keyword",
      "structurePubliqueEtatType.keyword",
      "isNetwork.keyword",
      "networkExist",
    ];
    const sortFields = [];
    // Authorization
    if (!canSearchInElasticSearch(req.user, "structure")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { structureContextFilters, structureContextError } = await buildStructureContext(user);
    if (structureContextError) {
      return res.status(structureContextError.status).send(structureContextError.body);
    }

    // Context filters
    let contextFilters = [...structureContextFilters];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
      customQueries: {
        networkExist: (query, value) => {
          console.log("networkExist", value);
          const conditions = [];
          if (value.includes("true"))
            conditions.push({ bool: { must_not: [{ term: { "networkId.keyword": "" } }, { bool: { must_not: { exists: { field: "networkId.keyword" } } } }] } });
          if (value.includes("false")) {
            conditions.push({ term: { "networkId.keyword": "" } });
            conditions.push({ bool: { must_not: { exists: { field: "networkId.keyword" } } } });
          }
          if (conditions.length) query.bool.must.push({ bool: { should: conditions } });
          return query;
        },
        networkExistAggs: () => {
          return {
            terms: { field: "networkId.keyword", size: ES_NO_LIMIT, missing: "N/A" },
          };
        },
      },
    });

    let structures;
    let response;
    if (req.params.action === "export") {
      response = await allRecords("structure", hitsRequestBody.query);
      structures = response.map((s) => ({ _id: s._id, _source: s }));
    } else {
      const esResponse = await esClient().msearch({ index: "structure", body: buildNdJson({ index: "structure", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      response = esResponse.body;
      structures =
        response && response.responses && response.responses.length > 0 && response.responses[0].hits && response.responses[0].hits.hits ? response.responses[0].hits.hits : [];
    }

    const structureIds = [...new Set(structures.map((item) => item._id).filter((e) => e))];
    if (structureIds.length > 0) {
      // --- fill team
      const referents = await allRecords("referent", {
        bool: {
          must: {
            match_all: {},
          },
          filter: [{ terms: { "structureId.keyword": structureIds } }],
        },
      });
      if (referents.length > 0) {
        for (let structure of structures) {
          structure._source.team = referents.filter((r) => r.structureId === structure._id);
        }
      }

      // --- fill missions
      const missions = await allRecords("mission", {
        bool: {
          must: {
            match_all: {},
          },
          filter: [{ terms: { "structureId.keyword": structureIds } }],
        },
      });
      if (missions.length > 0) {
        for (let structure of structures) {
          structure._source.missions = missions.filter((m) => m.structureId === structure._id);
        }
      }
    }

    if (req.params.action === "export") {
      return res.status(200).send({ ok: true, data: response });
    } else {
      return res.status(200).send(response);
    }
  } catch (error) {
    console.log("ERROR: ", error);
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
