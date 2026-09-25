import { PermissionType } from "../mongoSchema/permissions/permission";
import { ReferentType } from "../mongoSchema/referent";
import { UserDto } from "../dto";
import { PERMISSION_ACTIONS } from "./constantes/actions";

export function getUserRoles(user: Partial<ReferentType>): string[] {
  return (user.roles && user.roles.length > 0 ? user.roles : [user.role, user.subRole]).filter(Boolean) as string[];
}

type Acl = NonNullable<UserDto["acl"]>[number];

/**
 * Permissions de l'ACL qui portent sur la ressource et l'action demandées (l'action FULL couvre toutes les actions).
 * Prédicat partagé par `isAuthorized` (contrôle par document) et `getPolicyMongoFilter` (filtre de requête)
 * afin que les deux ne divergent jamais.
 */
export function getMatchingPermissions(user: Pick<UserDto, "acl">, resource: string, action: PermissionType["action"]): Acl[] {
  return (user.acl || []).filter((acl) => acl.resource === resource && [action, PERMISSION_ACTIONS.FULL].includes(acl.action));
}

/**
 * Accès sans restriction : au moins une permission sans policy ET aucune permission scopée
 * sur la même ressource/action.
 *
 * La policy la plus restrictive gagne : une permission large seedée sans policy ne doit jamais
 * annuler silencieusement une policy écrite pour restreindre le même rôle (audit 2026-09-21, H87).
 * Sans cette précédence, tout `isXxxAuthorized({ context })` est un no-op pour les rôles concernés
 * et `getPolicyMongoFilter` renvoie « aucune restriction ».
 */
export function hasUnrestrictedPermission(permissions: Acl[]): boolean {
  if (!permissions.length) return false;
  if (permissions.some((acl) => acl.policy?.length)) return false;
  return true;
}
