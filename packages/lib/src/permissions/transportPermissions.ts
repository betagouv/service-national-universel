import { actions } from ".";
import { CohortType } from "../mongoSchema";
import { ROLES } from "../roles";

export const transportPermissions = (cohort: CohortType): Record<string, Record<string, boolean>> => ({
  [actions.transport.updateTransport]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: cohort.busEditionOpenForTransporter,
  },
  [actions.transport.updatePdrId]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: false,
  },
  [actions.transport.updatePdrSchedule]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: cohort.busEditionOpenForTransporter,
  },
  [actions.transport.updatePdrTransportType]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: cohort.busEditionOpenForTransporter,
  },
  [actions.transport.updateCenterId]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: false,
  },
  [actions.transport.updateCenterSchedule]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: cohort.busEditionOpenForTransporter,
  },
  [actions.transport.sendNotifications]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: false,
  },
});
