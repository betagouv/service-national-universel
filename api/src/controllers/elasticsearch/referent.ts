import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";
import { isValidObjectId } from "mongoose";

import { ROLES, canSearchInElasticSearch, department2region, region2department, departmentList, ES_NO_LIMIT, UserDto, PERMISSION_RESOURCES, PERMISSION_ACTIONS } from "snu-lib";

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

/**
 * Rôles rattachés à un département (et parfois à une région).
 * `referent_classe`, `administrateur_cle` et la famille chef de centre en sont
 * absents : ces rôles n'existent plus sur la plateforme, l'annuaire ne doit plus
 * les remonter même si des comptes résiduels subsistent en base.
 */
const DEPARTMENT_SCOPED_ROLES = [ROLES.REFERENT_DEPARTMENT];

/** Rôles rattachés à une structure et non à une géographie. */
const STRUCTURE_SCOPED_ROLES = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR];

/** `department` est typé `string | string[]` dans le modèle. */
function toDepartments(department: UserDto["department"]): string[] {
  if (!department) return [];
  return Array.isArray(department) ? department : [department];
}

/**
 * Structures du périmètre d'un référent départemental ou régional.
 *
 * Doit rester aligné sur la lecture d'une fiche (`isReferentReadableByUser`) : un responsable
 * n'apparaît dans l'annuaire que si sa fiche est lisible (GOO-46).
 * - référent départemental : les structures de SES départements. Le critère « région de ses
 *   départements » remontait toutes les structures de la région, donc les coordonnées de leurs
 *   responsables, alors que leurs fiches répondaient 403 ;
 * - référent régional : les structures de sa région (région ou département de la région, certaines
 *   ne portent que l'un des deux).
 * Les têtes de réseau rattachées ne sont plus ajoutées : situées hors du territoire (souvent
 * nationales), leurs responsables n'étaient pas lisibles par le référent.
 */
async function getStructureIdsInPerimeter(user: UserDto): Promise<string[]> {
  // Sans région, `{ region: undefined }` remonterait les structures sans région.
  if (user.role === ROLES.REFERENT_REGION && !user.region) return [];
  const query =
    user.role === ROLES.REFERENT_REGION
      ? { $or: [{ region: user.region }, { department: { $in: region2department[user.region as string] || [] } }] }
      : { department: { $in: toDepartments(user.department) } };

  const structures = await StructureModel.find(query).select({ _id: 1 });
  return structures.map((structure) => structure._id.toString());
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
  // Ces deux branches listaient les rôles SANS borne géographique : un référent
  // départemental voyait l'intégralité de l'annuaire des référents (H24).
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    const departments = toDepartments(user.department);
    const regions = [...new Set(departments.map((department) => department2region[department]).filter(Boolean))];
    contextFilters.push({
      bool: {
        minimum_should_match: 1,
        should: [
          { bool: { must: [{ terms: { "role.keyword": DEPARTMENT_SCOPED_ROLES } }, { terms: { "department.keyword": departments } }] } },
          { bool: { must: [{ terms: { "role.keyword": [ROLES.REFERENT_REGION, ROLES.VISITOR] } }, { terms: { "region.keyword": regions } }] } },
          { bool: { must: [{ terms: { "role.keyword": STRUCTURE_SCOPED_ROLES } }, { terms: { "structureId.keyword": await getStructureIdsInPerimeter(user) } }] } },
        ],
      },
    });
  }

  if (user.role === ROLES.REFERENT_REGION) {
    const departments = region2department[user.region as string] || [];
    contextFilters.push({
      bool: {
        minimum_should_match: 1,
        should: [
          { bool: { must: [{ terms: { "role.keyword": [ROLES.REFERENT_REGION, ROLES.VISITOR] } }, { term: { "region.keyword": user.region } }] } },
          {
            bool: {
              must: [
                { terms: { "role.keyword": DEPARTMENT_SCOPED_ROLES } },
                // Certains référents ne portent que la région, d'autres que le département.
                { bool: { minimum_should_match: 1, should: [{ term: { "region.keyword": user.region } }, { terms: { "department.keyword": departments } }] } },
              ],
            },
          },
          { bool: { must: [{ terms: { "role.keyword": STRUCTURE_SCOPED_ROLES } }, { terms: { "structureId.keyword": await getStructureIdsInPerimeter(user) } }] } },
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

/**
 * Qui peut lister les référents (tuteurs) d'une structure donnée ?
 * Ce endpoint alimente les sélecteurs de tuteur : il ne doit pas servir d'oracle
 * pour énumérer les tuteurs de n'importe quelle structure (H25).
 */
async function canReadStructureReferents(user: UserDto, structureId: string): Promise<boolean> {
  if ([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role)) return true;

  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
    if (!user.structureId) return false;
    if (String(user.structureId) === String(structureId)) return true;
    // Un superviseur voit aussi les structures de son réseau.
    if (user.role === ROLES.SUPERVISOR) {
      const structure = await findStructureById(structureId);
      return !!structure && String(structure.networkId) === String(user.structureId);
    }
    // Un responsable voit la tête de réseau de sa propre structure.
    const ownStructure = await findStructureById(String(user.structureId));
    return !!ownStructure?.networkId && String(ownStructure.networkId) === String(structureId);
  }

  return false;
}

/** Un identifiant arbitraire ne doit pas provoquer de CastError (500). */
async function findStructureById(id: string) {
  if (!isValidObjectId(id)) return null;
  return StructureModel.findById(id);
}

const router = express.Router();

router.post(
  "/team/:action(search|export)",
  authMiddleware(["referent"]),
  // `ignorePolicy` est volontaire : sur une route de recherche il n'y a pas de document à soumettre
  // à la policy, et l'évaluer sans contexte refuserait en fail-closed les responsables et superviseurs
  // (leur seule permission REFERENT est `USER_SAME_STRUCTURE_FULL`, qui porte une policy). Le
  // cloisonnement est assuré plus bas, par le périmètre poussé dans la requête Elasticsearch.
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.REFERENT, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { user, body } = req;
      // Configuration
      const searchFields = ["email", "firstName", "lastName"];
      const filterFields = ["role.keyword", "subRole.keyword", "region.keyword", "department.keyword", "status.keyword"];
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

      // Les deux bornes ci-dessus ne couvrent que les référents départementaux et régionaux.
      // Tous les autres rôles admis par `canSearchInElasticSearch` (responsable, superviseur, chef
      // de centre, administrateur CLE, référent de classe) interrogeaient l'index sans aucune borne :
      // l'onglet Équipe leur restituait l'annuaire national des référents. L'administrateur, lui,
      // ne reçoit aucune clause : `buildReferentContext` n'en produit pas pour ce rôle.
      if (![ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
        const { referentContextFilters, referentContextError } = await buildReferentContext(user);
        if (referentContextError) return res.status(referentContextError.status).send(referentContextError.body);
        contextFilters.push(...(referentContextFilters || []));
      }

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
        return res.status(200).send({ ok: true, data: serializeReferents(response) });
      } else {
        const response = await esClient.msearch({ index: "referent", body: buildNdJson({ index: "referent", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
        return res.status(200).send(serializeReferents(response.body));
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
    const filterFields = ["role.keyword", "subRole.keyword", "region.keyword", "department.keyword", "cohorts.keyword", "structureId.keyword", "status.keyword"];
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

    const { error: errorParams, value: params } = Joi.object({
      structure: Joi.string().trim().required(),
    }).validate(req.params, { stripUnknown: true });
    if (errorParams) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!(await canReadStructureReferents(req.user, params.structure))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const response = await esClient.msearch({
      index: "referent",
      body: buildNdJson(
        { index: "referent", type: "_doc" },
        {
          query: {
            bool: {
              must: { match_all: {} },
              filter: [{ term: { "structureId.keyword": params.structure } }, { terms: { "role.keyword": [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } }],
            },
          },
          size: ES_NO_LIMIT,
        },
      ),
    });
    return res.status(200).send(serializeReferents(response.body));
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
