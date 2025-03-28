import { actions } from "../";
import { CohortType } from "../../mongoSchema";
import { ROLES } from "../../roles";

export const transportPermissions = (cohort: CohortType): Record<string, Record<string, boolean>> => ({
  [actions.transport.UPDATE]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: cohort.busEditionOpenForTransporter,
  },
  [actions.transport.UPDATE_PDR_ID]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: false,
  },
  [actions.transport.UPDATE_PDR_SCHEDULE]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: cohort.busEditionOpenForTransporter,
  },
  [actions.transport.UPDATE_TYPE]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: cohort.busEditionOpenForTransporter,
  },
  [actions.transport.UPDATE_SESSION_ID]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: false,
  },
  [actions.transport.UPDATE_CENTER_SCHEDULE]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: cohort.busEditionOpenForTransporter,
  },
  [actions.transport.NOTIFY_AFTER_UPDATE]: {
    [ROLES.ADMIN]: true,
    [ROLES.TRANSPORTER]: false,
  },
});
