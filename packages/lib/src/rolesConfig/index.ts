import { CohortType } from "../mongoSchema";
import { UserDto } from "../dto";
import { ROLES } from "src/roles";
import { actions } from "src/actions";

// TODO: Move to DB
const roleDocuments = (cohort: CohortType) => [
  {
    role: ROLES.ADMIN,
    permissions: {
      [actions.transport.UPDATE]: true,
      [actions.transport.UPDATE_PDR_ID]: true,
      [actions.transport.UPDATE_PDR_SCHEDULE]: true,
      [actions.transport.UPDATE_TYPE]: true,
      [actions.transport.UPDATE_SESSION_ID]: true,
      [actions.transport.UPDATE_CENTER_SCHEDULE]: true,
      [actions.transport.NOTIFY_AFTER_UPDATE]: true,
    },
  },
  {
    role: ROLES.TRANSPORTER,
    permissions: {
      [actions.transport.UPDATE]: cohort.busEditionOpenForTransporter,
      [actions.transport.UPDATE_PDR_SCHEDULE]: cohort.busEditionOpenForTransporter,
      [actions.transport.UPDATE_TYPE]: cohort.busEditionOpenForTransporter,
      [actions.transport.UPDATE_CENTER_SCHEDULE]: cohort.busEditionOpenForTransporter,
    },
  },
];

export function hasPermission(user: UserDto, cohort: CohortType, action: string): boolean {
  const permissions = roleDocuments(cohort).find((doc) => doc.role === user.role)?.permissions;
  if (!permissions || !permissions[action]) return false;
  return permissions[action];
}
