import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";

import { ROLES, canSearchInElasticSearch, department2region, departmentList, ES_NO_LIMIT, UserDto, PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "snu-lib";

import { capture } from "../../sentry";
import esClient from "../../es";
import { ERRORS } from "../../utils";
import { allRecords } from "../../es/utils";
import { buildNdJson, buildRequestBody, joiElasticSearch } from "./utils";
import { StructureModel, EtablissementModel, ClasseModel } from "../../models";
import { serializeReferents } from "../../utils/es-serializer";
import { UserRequest } from "../request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";

interface ReferentContext {
  referentContextFilters?: any[];
  referentContextError?: {
    status: number;
    body: {
      ok: boolean;
      code: string;
    };
  };
}

async function buildReferentContext(user: UserDto): Promise<ReferentContext> {
  const contextFilters: any[] = [];

  // A responsible cans only see their structure's referent (responsible and supervisor).
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { referentContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const structure = await StructureModel.findById(user.structureId);
    if (!structure) return { referentContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
    const structureIdKeyword = [user.structureId];
    if (structure.networkId) structureIdKeyword.push(structure.networkId);
    contextFilters.push({ terms: { "structureId.keyword": structureIdKeyword } });
  }

  // A supervisor can only see their structures' referent (responsible and supervisor).
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { referentContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const data = await StructureModel.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    contextFilters.push({ terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
    contextFilters.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
  }

  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    contextFilters.push({
      bool: {
        should: [
          {
            terms: {
              "role.keyword": [
                ROLES.REFERENT_DEPARTMENT,
                ROLES.SUPERVISOR,
                ROLES.RESPONSIBLE,
                ROLES.HEAD_CENTER,
                ROLES.HEAD_CENTER_ADJOINT,
                ROLES.REFERENT_SANITAIRE,
                ROLES.REFERENT_REGION,
                ROLES.REFERENT_CLASSE,
                ROLES.ADMINISTRATEUR_CLE,
              ],
            },
          },
          {
            bool: {
              must: [{ terms: { "role.keyword": [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE] } }, { terms: { "department.keyword": user.department } }],
            },
          },
        ],
      },
    });
  }

  if (user.role === ROLES.REFERENT_REGION) {
    contextFilters.push({
      bool: {
        should: [
          {
            terms: {
              "role.keyword": [
                ROLES.REFERENT_REGION,
                ROLES.SUPERVISOR,
                ROLES.RESPONSIBLE,
                ROLES.HEAD_CENTER,
                ROLES.HEAD_CENTER_ADJOINT,
                ROLES.REFERENT_SANITAIRE,
                ROLES.ADMINISTRATEUR_CLE,
                ROLES.REFERENT_CLASSE,
              ],
            },
          },
          { bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_DEPARTMENT } }, { term: { "region.keyword": user.region } }] } },
          { bool: { must: [{ term: { "role.keyword": ROLES.VISITOR } }, { term: { "region.keyword": user.region } }] } },
        ],
      },
    });
  }

  if ([ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(user.role)) {
    contextFilters.push({
      bool: {
        must: [{ terms: { "role.keyword": [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE, ROLES.REFERENT_DEPARTMENT] } }],
      },
    });
  }

  if (user.role === ROLES.ADMINISTRATEUR_CLE) {
    /*
      Can see:
      - all referents dep of the department of his etablissement
      - all ref ADMIN CLE of his etablissement
      - all ref Classe of his etablissement
    */
    const refIds: string[] = [];
    const etablissement = await EtablissementModel.findOne({ $or: [{ coordinateurIds: user._id }, { referentEtablissementIds: user._id }] });
    if (!etablissement) return { referentContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const classes = await ClasseModel.find({ etablissementId: etablissement._id });
    refIds.push(...classes.flatMap((c) => c.referentClasseIds), ...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds);
    contextFilters.push({
      bool: {
        should: [
          { bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_DEPARTMENT } }, { term: { "department.keyword": etablissement.department } }] } },
          { bool: { must: { ids: { values: refIds } } } },
        ],
      },
    });
  }

  if (user.role === ROLES.REFERENT_CLASSE) {
    /*
      Can see:
      - all referents dep of the department of his etablissement
      - all ref ADMIN CLE of his etablissement
      - all ref Classe of his etablissement and all ref of hiis departement
    */
    const classes = await ClasseModel.findOne({ referentClasseIds: user._id });
    if (!classes) return { referentContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const etablissement = await EtablissementModel.findOne({ _id: classes.etablissementId });
    const refIds = [...(etablissement?.referentEtablissementIds || []), ...(etablissement?.coordinateurIds || [])];
    contextFilters.push({
      bool: {
        should: [
          { bool: { must: [{ terms: { "role.keyword": [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_CLASSE] } }, { term: { "department.keyword": etablissement?.department } }] } },
          { bool: { must: { ids: { values: refIds } } } },
        ],
      },
    });
  }
  return { referentContextFilters: contextFilters };
}

const router = express.Router();

router.post(
  "/team/:action(search|export)",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.REFERENT, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { user, body } = req;
      // Configuration
      const searchFields = ["email", "firstName", "lastName"];
      const filterFields = ["role.keyword", "subRole.keyword", "region.keyword", "department.keyword"];
      const sortFields: string[] = [];
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
      const contextFilters: any[] = [
        user.role === ROLES.REFERENT_DEPARTMENT ? { terms: { "region.keyword": (user.department as string[]).map((depart) => department2region[depart]) } } : null,
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
  },
);

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { user, body } = req;
    // Configuration
    const searchFields = ["email.keyword", "firstName.folded", "lastName.folded"];
    const filterFields = ["role.keyword", "subRole.keyword", "region.keyword", "department.keyword", "cohorts.keyword", "structureId.keyword"];
    const sortFields = ["lastName.keyword", "firstName.keyword", "createdAt", "lastLoginAt"];

    // Authorization
    if (!canSearchInElasticSearch(user, "referent")) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    //Query params validation
    const { error: errorQuery, value: query } = Joi.object({
      cohort: Joi.string().trim().allow(null),
    }).validate(req.query, { stripUnknown: true });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { referentContextFilters, referentContextError } = await buildReferentContext(user);
    if (referentContextError) {
      return res.status(referentContextError.status).send(referentContextError.body);
    }

    // Context filters
    const contextFilters = [
      ...(referentContextFilters || []),
      { bool: { must_not: { exists: { field: "deletedAt" } } } },
      query.cohort
        ? {
            bool: {
              should: [
                { bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_DEPARTMENT } }] } },
                {
                  bool: {
                    must: [
                      { terms: { "role.keyword": [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE] } },
                      { terms: { "cohorts.keyword": [query.cohort] } },
                    ],
                  },
                },
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

router.post("/structure/:structure", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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

export default router;
