import express, { Response } from "express";
import { ROLES, canSearchInElasticSearch, ES_NO_LIMIT, UserDto, PERMISSION_RESOURCES, PERMISSION_ACTIONS, getPolicyElasticFilter } from "snu-lib";
import { capture } from "../../sentry";
import esClient from "../../es";
import { ERRORS } from "../../utils";
import { allRecords } from "../../es/utils";
import { joiElasticSearch, buildNdJson, buildRequestBody } from "./utils";
import { StructureModel } from "../../models";
import { serializeMissions, serializeReferents, serializeStructures } from "../../utils/es-serializer";
import { UserRequest } from "../request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";

// Seuls champs de l'équipe consommés par le front : le compte de responsables
// dans la liste des structures et les colonnes nom/prénom/email de l'export.
// `structureId` sert au rattachement structure <-> membre.
const TEAM_FIELDS = ["firstName", "lastName", "email", "role", "structureId"];

interface StructureContext {
  structureContextFilters?: any[];
  structureContextError?: {
    status: number;
    body: {
      ok: boolean;
      code: string;
    };
  };
}

/**
 * Périmètre de l'index `structure`.
 *
 * Deux sources, réunies en un seul `should` :
 *  - les policies IAM (`STRUCTURE_REGION`, `STRUCTURE_DEPARTEMENT`, `STRUCTURE_TETERESEAU`,
 *    `STRUCTURE_SAME_STRUCTURE`), traduites en clauses ES. C'est la seule borne pour les référents
 *    départementaux et régionaux, qui n'en avaient aucune : ils listaient toutes les structures de
 *    France alors que leur permission est explicitement restreinte à leur géographie.
 *  - les clauses historiques ci-dessous, qui accordent au responsable la tête de réseau de sa
 *    structure et au superviseur l'ensemble de son réseau. Elles ne sont pas toutes dérivables des
 *    policies : les conserver garantit qu'aucun périmètre existant n'est réduit.
 *
 * Fail-closed : sans aucune clause exploitable, la requête est refusée plutôt que laissée ouverte.
 */
async function buildStructureContext(user: UserDto): Promise<StructureContext> {
  const contextFilters: any[] = [];

  // A responsible can only see their structure and parent structure (not sure why we need ES though).
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { structureContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const structure = await StructureModel.findById(user.structureId);
    if (!structure) return { structureContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    let idsArray = [structure._id.toString()];
    if (structure.networkId !== "") {
      const parent = await StructureModel.findById(structure.networkId);
      idsArray.push(parent?._id?.toString());
    }
    contextFilters.push({ terms: { _id: idsArray.filter((e) => e) } });
  }

  // A supervisor can only see their structures (all network).
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { structureContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const data = await StructureModel.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    contextFilters.push({ terms: { _id: data.map((e) => e._id.toString()) } });
  }

  const policyFilter = getPolicyElasticFilter({ user, resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ });

  // `null` : une permission sans policy (administrateur) => aucune borne à ajouter.
  if (policyFilter === null) return { structureContextFilters: contextFilters };

  // Aucune permission exploitable et aucune borne historique : on refuse au lieu de tout ouvrir.
  if (policyFilter === undefined && !contextFilters.length) {
    return { structureContextError: { status: 403, body: { ok: false, code: ERRORS.OPERATION_UNAUTHORIZED } } };
  }

  // Les deux sources sont alternatives : une structure du périmètre historique OU du périmètre IAM.
  const perimeterClauses = [...contextFilters, ...(policyFilter ? [policyFilter] : [])];
  return { structureContextFilters: [{ bool: { should: perimeterClauses, minimum_should_match: 1 } }] };
}

const router = express.Router();

router.post(
  "/:action(search|export)",
  authMiddleware(["referent"]),
  // `ignorePolicy` ne vaut ici que pour le filtrage grossier par rôle : la policy elle-même est
  // appliquée par `buildStructureContext`, qui la traduit en filtre Elasticsearch (elle ne peut pas
  // l'être ici, faute de document à évaluer).
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
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
      const sortFields: string[] = [];
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
      let contextFilters = [...(structureContextFilters || [])];

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
          networkExist: (query: any, value: string[]) => {
            const conditions: any[] = [];
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

      let structures: any[];
      let response: any;
      if (req.params.action === "export") {
        response = await allRecords("structure", hitsRequestBody.query);
        structures = response.map((s: any) => ({ _id: s._id, _source: s }));
      } else {
        const esResponse = await esClient.msearch({ index: "structure", body: buildNdJson({ index: "structure", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
        response = esResponse.body;
        structures =
          response && response.responses && response.responses.length > 0 && response.responses[0].hits && response.responses[0].hits.hits ? response.responses[0].hits.hits : [];
      }

      const structureIds = [...new Set(structures.map((item) => item._id).filter((e) => e))];
      if (structureIds.length > 0) {
        // --- fill team
        // La projection est demandée à Elasticsearch : le document referent complet
        // (téléphone, mobile, horodatages de connexion, metadata) ne transite pas.
        const referents = await allRecords(
          "referent",
          {
            bool: {
              must: {
                match_all: {},
              },
              filter: [{ terms: { "structureId.keyword": structureIds } }],
            },
          },
          esClient,
          TEAM_FIELDS,
        );
        if (referents.length > 0) {
          // Les documents de l'index `referent` sont recopiés dans la réponse : ils passent par le
          // sérialiseur de leur propre index, sans quoi rien ne les filtrerait ici.
          const serializedReferents = serializeReferents(referents);
          for (let structure of structures) {
            structure._source.team = serializedReferents.filter((r) => r.structureId === structure._id);
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
          const serializedMissions = serializeMissions(missions);
          for (let structure of structures) {
            structure._source.missions = serializedMissions.filter((m) => m.structureId === structure._id);
          }
        }
      }

      if (req.params.action === "export") {
        return res.status(200).send({ ok: true, data: serializeStructures(response) });
      } else {
        return res.status(200).send(serializeStructures(response));
      }
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
