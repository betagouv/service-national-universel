import { PermissionType } from "../mongoSchema/permissions/permission";
import { ReferentType } from "../mongoSchema/referent";
import { PERMISSION_ACTIONS } from "./constantes/actions";

export function getUserRoles(user: Partial<ReferentType>): string[] {
  return (user.roles && user.roles.length > 0 ? user.roles : [user.role, user.subRole]).filter(Boolean) as string[];
}

export function getPolicyQuery(policy: PermissionType["policy"][0], user: Partial<ReferentType>): any {
  if (!policy.where || policy.where.length === 0) {
    throw new Error("Cannot handle policy with multiple where clauses yet");
  }
  const where = policy.where[0];
  const value = where.source ? user[where.source] : where.value;
  if (!value) {
    throw new Error("No value found for policy");
  }
  return {
    [where.field]: value,
  };
}

export function getPermissionActions(action?: PermissionType["action"]): PermissionType["action"][] {
  return action ? [action, PERMISSION_ACTIONS.FULL] : [PERMISSION_ACTIONS.FULL];
}
