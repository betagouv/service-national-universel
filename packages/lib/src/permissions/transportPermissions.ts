import { CohortType } from "../mongoSchema";
import { ROLES } from "../roles";

export const transportActions = {
  updateTransport: "updateTransport",
  updatePdrId: "updatePdrId",
  updatePdrSchedule: "updatePdrSchedule",
  updatePdrTransportType: "updatePdrTransportType",
  updateCenterId: "updateCenterId",
  updateCenterSchedule: "updateCenterSchedule",
  sendNotifications: "sendNotifications",
};

const transportPermissions = (cohort: CohortType) => ({
  [ROLES.ADMIN]: {
    [transportActions.updateTransport]: true,
    [transportActions.updatePdrId]: true,
    [transportActions.updatePdrSchedule]: true,
    [transportActions.updatePdrTransportType]: true,
    [transportActions.updateCenterId]: true,
    [transportActions.updateCenterSchedule]: true,
    [transportActions.sendNotifications]: true,
  },
  [ROLES.TRANSPORTER]: {
    [transportActions.updateTransport]: cohort.busEditionOpenForTransporter,
    [transportActions.updatePdrId]: false,
    [transportActions.updatePdrSchedule]: cohort.busEditionOpenForTransporter,
    [transportActions.updatePdrTransportType]: cohort.busEditionOpenForTransporter,
    [transportActions.updateCenterId]: false,
    [transportActions.updateCenterSchedule]: cohort.busEditionOpenForTransporter,
    [transportActions.sendNotifications]: false,
  },
});

export function hasPermission(role: (typeof ROLES)[keyof typeof ROLES], cohort: CohortType, action: string): boolean {
  if (!transportPermissions(cohort)[role]) return false;
  return transportPermissions(cohort)[role][action] ?? false;
}
