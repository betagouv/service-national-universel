import { CohortType } from "../mongoSchema";
import { transportPermissions } from "./transport/transportPermissions";
import { transportActions } from "./transport/transportActions";
import { UserDto } from "../dto";

export const actions = {
  transport: transportActions,
};

const permissions = (cohort: CohortType) => ({
  ...transportPermissions(cohort),
});

export function hasPermission(user: UserDto, cohort: CohortType, action: string): boolean {
  if (!permissions(cohort)[action]) throw new Error(`Action ${action} not found`);
  if (!permissions(cohort)[action][user.role]) return false;
  return permissions(cohort)[action][user.role];
}
