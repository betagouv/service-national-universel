import { UserDto } from "../dto";
import { PERMISSION_ACTIONS } from "./constantes/actions";
import { PermissionType } from "../mongoSchema";
import { getMatchingPermissions, hasUnrestrictedPermission } from "./utils";

type Action = PermissionType["action"];

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Une valeur destinée à un champ `_id` doit être un ObjectId valide : sinon Mongoose lève une CastError
 * (donc un 500) au lieu de ne rien renvoyer. Une valeur invalide est traitée comme absente (fail-closed).
 */
function isUsableValue(field: string, value: string): boolean {
  return field === "_id" ? OBJECT_ID_REGEX.test(value) : true;
}

export interface GetPolicyMongoFilterParams {
  user: UserDto;
  resource: string;
  action?: Action;
}

/**
 * Une clause `where` résolue : le champ visé et les valeurs autorisées pour l'utilisateur.
 * `multiple` retient que la valeur d'origine était une liste, pour conserver la forme `$in` en Mongo.
 */
type ResolvedClause = { field: string; values: string[]; multiple: boolean };

/**
 * Résout les clauses `where` des policies en couples champ / valeurs autorisées.
 *
 * `null`      : au moins une permission sans policy => aucune restriction.
 * `undefined` : aucune permission, ou aucune clause exploitable => l'appelant doit refuser.
 *
 * Fail-closed : une clause dont la valeur utilisateur est vide (ou inutilisable pour le champ)
 * est ignorée ; si aucune ne subsiste, l'accès n'est pas accordé.
 */
function resolvePolicyClauses({ user, resource, action }: Required<GetPolicyMongoFilterParams>): ResolvedClause[] | null | undefined {
  if (!user?.acl?.length) return undefined;

  const permissions = getMatchingPermissions(user, resource, action);
  if (!permissions.length) return undefined;

  if (hasUnrestrictedPermission(permissions)) return null;

  const clauses: ResolvedClause[] = [];
  for (const permission of permissions) {
    for (const policy of permission.policy) {
      for (const where of policy.where || []) {
        // une clause qui cible une autre ressource que celle interrogée ne peut pas être traduite en filtre sur cette collection
        if (where.resource && where.resource !== resource) continue;
        if (!where.field) continue;

        let value: unknown;
        if (where.source) {
          value = (user as Record<string, unknown>)[where.source];
        } else if (where.value) {
          value = where.value;
        }

        const multiple = Array.isArray(value);
        const values = (multiple ? (value as unknown[]) : [value])
          .filter((candidate) => candidate !== undefined && candidate !== null && candidate !== "")
          .map(String)
          .filter((candidate) => isUsableValue(where.field, candidate));
        if (!values.length) continue;

        clauses.push({ field: where.field, values, multiple });
      }
    }
  }

  if (!clauses.length) return undefined;
  return clauses;
}

/**
 * Traduit les policies de l'ACL de l'utilisateur en filtre Mongo pour une ressource/action.
 *
 * - `null`      : au moins une permission sans policy => aucune restriction.
 * - `undefined` : aucune permission exploitable => l'appelant doit refuser (403).
 * - objet       : filtre `{ $or: [...] }` à passer à `Model.find()`.
 */
export function getPolicyMongoFilter({ user, resource, action = PERMISSION_ACTIONS.READ }: GetPolicyMongoFilterParams): Record<string, unknown> | null | undefined {
  const clauses = resolvePolicyClauses({ user, resource, action });
  if (!clauses) return clauses;
  return { $or: clauses.map(({ field, values, multiple }) => (multiple ? { [field]: { $in: values } } : { [field]: values[0] })) };
}

/**
 * Pendant Elasticsearch de `getPolicyMongoFilter` : traduit les mêmes policies en clauses de
 * filtre ES, pour les routes de recherche qui n'ont pas de document à soumettre à `isAuthorized`.
 *
 * - `null`      : au moins une permission sans policy => aucune restriction.
 * - `undefined` : aucune permission exploitable => l'appelant doit refuser (403).
 * - objet       : clause `bool` à pousser dans les `contextFilters` de la requête.
 *
 * Les deux traductions partagent `resolvePolicyClauses` afin de ne jamais diverger : un périmètre
 * accordé en Mongo l'est à l'identique en ES.
 */
export function getPolicyElasticFilter({ user, resource, action = PERMISSION_ACTIONS.READ }: GetPolicyMongoFilterParams): Record<string, unknown> | null | undefined {
  const clauses = resolvePolicyClauses({ user, resource, action });
  if (!clauses) return clauses;
  return { bool: { should: clauses.map(toElasticTerms), minimum_should_match: 1 } };
}

/**
 * `_id` est le champ interne du document et n'a pas de sous-champ `.keyword` ;
 * les autres champs sont indexés en `text` et ne sont comparables exactement que via `.keyword`.
 */
function toElasticTerms({ field, values }: ResolvedClause): Record<string, unknown> {
  return { terms: { [field === "_id" ? "_id" : `${field}.keyword`]: values } };
}
