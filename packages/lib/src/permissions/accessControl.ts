import { PermissionType } from "../mongoSchema";
import { UserDto } from "../dto";
import { PERMISSION_ACTIONS } from "./constantes/actions";
import { HasPermissionParams } from "./types";
import { getMatchingPermissions, hasUnrestrictedPermission } from "./utils";

export function isAuthorized({ user, resource, action = PERMISSION_ACTIONS.READ, context, ignorePolicy = false }: HasPermissionParams): boolean {
  if (!user) {
    console.warn(`user is not defined`);
    return false;
  }
  if (!user.acl) {
    console.warn(`user ${user._id} has no acl`);
    return false;
  }
  const permissions = getMatchingPermissions(user, resource, action);
  if (permissions?.length) {
    if (ignorePolicy) {
      return true;
    }
    if (hasUnrestrictedPermission(permissions)) {
      return true;
    }
    const permissionWithpolicies = permissions.filter((acl) => acl.policy?.length);
    const contextUpdated = { referent: user, ...context };
    const authorized: boolean[] = [];
    for (const permission of permissionWithpolicies) {
      for (const policy of permission.policy) {
        if (policy.where?.length) {
          for (const where of policy.where) {
            const contextResource = where.resource || resource;
            const contextValue = contextUpdated[contextResource]?.[where.field];
            // fail-closed : une valeur absente ne peut jamais matcher
            if (contextValue === undefined || contextValue === null || contextValue === "") {
              authorized.push(false);
              continue;
            }
            if (where.source) {
              const userValue = user[where.source];
              if (Array.isArray(userValue)) {
                authorized.push(userValue.filter(Boolean).map(String).includes(String(contextValue)));
              } else if (userValue === undefined || userValue === null || userValue === "") {
                authorized.push(false);
              } else {
                authorized.push(String(contextValue) === String(userValue));
              }
            } else if (where.value) {
              authorized.push(String(contextValue) === String(where.value));
            } else {
              authorized.push(false);
            }
          }
        } else {
          authorized.push(false);
        }
      }
    }
    // au moins une condition des policy doit être vérifiée
    return authorized.some((isAuthorized) => isAuthorized);
  }
  return false;
}

export function isCreateAuthorized({ user, resource, context, ignorePolicy }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.CREATE, context, ignorePolicy });
}

export function isReadAuthorized({ user, resource, context, ignorePolicy }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.READ, context, ignorePolicy });
}

export function isWriteAuthorized({ user, resource, context, ignorePolicy }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.WRITE, context, ignorePolicy });
}

export function isDeleteAuthorized({ user, resource, context, ignorePolicy }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.DELETE, context, ignorePolicy });
}

export function isExecuteAuthorized({ user, resource, context, ignorePolicy }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.EXECUTE, context, ignorePolicy });
}

export function isFullAuthorized({ user, resource, context, ignorePolicy }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.FULL, context, ignorePolicy });
}

export function hasPolicyForAttribute({ user, permissions, field }: { user: UserDto; permissions: PermissionType[]; field: string }): boolean {
  return (
    user.acl?.some(
      (acl) => permissions.some((permission) => permission.resource === acl.resource) && acl.policy?.some((policy) => policy.where?.some((where) => where.field === field)),
    ) || false
  );
}
