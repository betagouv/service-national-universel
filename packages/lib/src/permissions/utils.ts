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

/** Au moins une permission sans policy : l'accès à la ressource est sans restriction. */
export function hasUnrestrictedPermission(permissions: Acl[]): boolean {
  return permissions.some((acl) => !acl.policy?.length);
}
