import { ROLES } from "../roles";
import { CohortType } from "../mongoSchema";
import { transportPermissions } from "./transport/transportPermissions";
import { transportActions } from "./transport/transportActions";

export const actions = {
  transport: transportActions,
};

const permissions = (cohort: CohortType) => ({
  ...transportPermissions(cohort),
});

export function hasPermission(role: (typeof ROLES)[keyof typeof ROLES], cohort: CohortType, action: string): boolean {
  if (!permissions(cohort)[action]) throw new Error(`Action ${action} not found`);
  if (!permissions(cohort)[action][role]) return false;
  return permissions(cohort)[action][role];
}
