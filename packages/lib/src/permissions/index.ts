import { CohortType } from "../mongoSchema";
import { transportPermissions } from "./transportPermissions";
import { ROLES } from "../roles";

export const actions = {
  transport: {
    updateTransport: "updateTransport",
    updatePdrId: "updatePdrId",
    updatePdrSchedule: "updatePdrSchedule",
    updatePdrTransportType: "updatePdrTransportType",
    updateCenterId: "updateCenterId",
    updateCenterSchedule: "updateCenterSchedule",
    sendNotifications: "sendNotifications",
  },
};

export const permissions = (cohort: CohortType) => ({ ...transportPermissions(cohort) });

export function hasPermission(role: (typeof ROLES)[keyof typeof ROLES], cohort: CohortType, action: string): boolean {
  if (!permissions(cohort)[action]) throw new Error(`Action ${action} not found`);
  if (!permissions(cohort)[action][role]) return false;
  return permissions(cohort)[action][role];
}
