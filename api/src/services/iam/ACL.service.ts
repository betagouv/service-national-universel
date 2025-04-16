import { getUserRoles, PERMISSION_ACTIONS, HasPermissionParams, ReferentType } from "snu-lib";
import { PermissionRepository } from "./Permission.repository";
import { RoleRepository } from "./Role.repository";
import { hasPermissions } from "./Permission.service";

export async function getAcl(user: Partial<ReferentType>) {
  const rolesCodes = getUserRoles(user);
  const roles = await RoleRepository.findByCodesAndParent(rolesCodes);
  const permissions = await PermissionRepository.findByRoles(roles.map((role) => role.code));
  return permissions.map((permission) => ({
    code: permission.code,
    action: permission.action,
    ressource: permission.ressource,
    policy: permission.policy,
  }));
}

// Exemple:
//   hasReadPermission({ user, code: "AdminSupport" })
//   hasReadPermission({ user, code: "ExportInjep" })
//   hasReadPermission({ user, code: "UserProfile", context: { ressource: "referent", ressourceId: user.id } })
export async function hasReadPermission({ user, code, context }: HasPermissionParams) {
  return hasPermission({ user, code, action: PERMISSION_ACTIONS.READ, context });
}

// Exemple: l'utilisateur a-t-il les droits de modifier un etablissement ?
// hasUpdatePermission({ user, code: "AjouterCoordinateur", context: { ressource: "etablissement" } })
export async function hasUpdatePermission({ user, code, context }: HasPermissionParams) {
  return hasPermission({ user, code, action: PERMISSION_ACTIONS.UPDATE, context });
}

export async function hasDeletePermission({ user, code, context }: HasPermissionParams) {
  return hasPermission({ user, code, action: PERMISSION_ACTIONS.DELETE, context });
}

export async function hasExecutePermission({ user, code, context }: HasPermissionParams) {
  return hasPermission({ user, code, action: PERMISSION_ACTIONS.EXECUTE, context });
}

export async function hasPermission({ user, code, action, context }: HasPermissionParams) {
  const codes = [code];
  return hasPermissions({ user, codes, action, context });
}
