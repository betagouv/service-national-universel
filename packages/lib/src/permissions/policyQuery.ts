import { UserDto } from "../dto";
import { PERMISSION_ACTIONS } from "./constantes/actions";
import { PermissionType } from "../mongoSchema";

type Action = PermissionType["action"];

export interface GetPolicyMongoFilterParams {
  user: UserDto;
  resource: string;
  action?: Action;
}

/**
 * Traduit les policies de l'ACL de l'utilisateur en filtre Mongo pour une ressource/action.
 *
 * - `null`      : au moins une permission sans policy => aucune restriction.
 * - `undefined` : aucune permission exploitable => l'appelant doit refuser (403).
 * - objet       : filtre `{ $or: [...] }` à passer à `Model.find()`.
 *
 * Fail-closed : une clause `where` dont la valeur utilisateur est vide est ignorée ;
 * si aucune clause n'est exploitable, on renvoie `undefined`.
 */
export function getPolicyMongoFilter({ user, resource, action = PERMISSION_ACTIONS.READ }: GetPolicyMongoFilterParams): Record<string, unknown> | null | undefined {
  if (!user?.acl?.length) return undefined;

  const permissions = user.acl.filter((acl) => acl.resource === resource && [action, PERMISSION_ACTIONS.FULL].includes(acl.action));
  if (!permissions.length) return undefined;

  if (permissions.some((acl) => !acl.policy?.length)) return null;

  const clauses: Record<string, unknown>[] = [];
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

        if (Array.isArray(value)) {
          const values = value.filter((v) => v !== undefined && v !== null && v !== "").map(String);
          if (!values.length) continue;
          clauses.push({ [where.field]: { $in: values } });
        } else if (value !== undefined && value !== null && value !== "") {
          clauses.push({ [where.field]: String(value) });
        }
      }
    }
  }

  if (!clauses.length) return undefined;
  return { $or: clauses };
}
