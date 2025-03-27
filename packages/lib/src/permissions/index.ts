import { CohortType } from "src/mongoSchema";
import { transportActions, transportPermissions } from "./transportPermissions";
import { ROLES } from "src/roles";

export const actions = {
  transport: transportActions,
};

export const permissions = (cohort: CohortType) => ({ ...transportPermissions(cohort) });

export function hasPermission(role: (typeof ROLES)[keyof typeof ROLES], cohort: CohortType, action: string): boolean {
  if (!permissions(cohort)[action]) throw new Error(`Action ${action} not found`);
  if (!permissions(cohort)[action][role]) return false;
  return permissions(cohort)[action][role];
}
