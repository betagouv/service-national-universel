import { getUserRoles, ReferentType } from "snu-lib";
import { PermissionRepository } from "./Permission.repository";
import { RoleRepository } from "./Role.repository";

export async function getAcl(user: Partial<ReferentType>) {
  if (!user) return [];
  const rolesCodes = getUserRoles(user);
  const roles = await RoleRepository.findByCodesAndParent(rolesCodes);
  const permissions = await PermissionRepository.findByRoles(roles.map((role) => role.code));
  // TODO: compute whitelist of ressources (by department, structure, ...)
  return permissions.map((permission) => ({
    code: permission.code,
    action: permission.action,
    ressource: permission.ressource,
    policy: permission.policy,
  }));
}
