import { PERMISSION_ACTIONS } from "./constantes/actions";
import { HasPermissionParams } from "./types";

export function isAuthorized({ user, resource, action = PERMISSION_ACTIONS.READ, context }: HasPermissionParams): boolean {
  if (!user) {
    console.warn(`user is not defined`);
    return false;
  }
  if (!user.acl) {
    console.warn(`user ${user._id} has no acl`);
    return false;
  }
  const permissions = user.acl.filter((acl) => acl.resource === resource && [action, PERMISSION_ACTIONS.FULL].includes(acl.action));
  if (permissions?.length) {
    const permissionWithpolicies = permissions.filter((acl) => acl.policy?.length);
    if (!permissionWithpolicies.length) {
      return true;
    }
    const contextUpdated = { referent: user, ...context };
    const authorized: boolean[] = [];
    for (const permission of permissionWithpolicies) {
      for (const policy of permission.policy) {
        if (policy.where?.length) {
          for (const where of policy.where) {
            if (where.source) {
              authorized.push(contextUpdated[resource]?.[where.field] === user[where.source]);
            } else if (where.value) {
              authorized.push(contextUpdated[resource]?.[where.field] === where.value);
            } else {
              authorized.push(false);
            }
          }
        } else {
          authorized.push(false);
        }
      }
    }
    return authorized.every((isAuthorized) => isAuthorized);
  }
  return false;
}

export function isCreateAuthorized({ user, resource, context }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.CREATE, context });
}

export function isReadAuthorized({ user, resource, context }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.READ, context });
}

export function isWriteAuthorized({ user, resource, context }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.WRITE, context });
}

export function isDeleteAuthorized({ user, resource, context }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.DELETE, context });
}

export function isExecuteAuthorized({ user, resource, context }: HasPermissionParams): boolean {
  return isAuthorized({ user, resource, action: PERMISSION_ACTIONS.EXECUTE, context });
}
