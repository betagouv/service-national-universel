import { CohortType } from "../mongoSchema";
import { UserDto } from "../dto";
import { ROLES } from "../roles";
import { ACTIONS } from "../actions";

// TODO: Move to DB
const roleDocuments = (context?: { cohort?: CohortType }) => [
  {
    role: ROLES.ADMIN,
    permissions: {
      [ACTIONS.TRANSPORT.UPDATE]: true,
      [ACTIONS.TRANSPORT.UPDATE_PDR_ID]: true,
      [ACTIONS.TRANSPORT.UPDATE_PDR_SCHEDULE]: true,
      [ACTIONS.TRANSPORT.UPDATE_TYPE]: true,
      [ACTIONS.TRANSPORT.UPDATE_SESSION_ID]: true,
      [ACTIONS.TRANSPORT.UPDATE_CENTER_SCHEDULE]: true,
      [ACTIONS.TRANSPORT.SEND_NOTIFICATION]: true,
    },
  },
  {
    role: ROLES.TRANSPORTER,
    permissions: {
      [ACTIONS.TRANSPORT.UPDATE]: context?.cohort?.busEditionOpenForTransporter,
      [ACTIONS.TRANSPORT.UPDATE_PDR_SCHEDULE]: context?.cohort?.busEditionOpenForTransporter,
      [ACTIONS.TRANSPORT.UPDATE_TYPE]: context?.cohort?.busEditionOpenForTransporter,
      [ACTIONS.TRANSPORT.UPDATE_CENTER_SCHEDULE]: context?.cohort?.busEditionOpenForTransporter,
    },
  },
];

export function hasPermission(user: UserDto, action: string, context?: { cohort?: CohortType }): boolean {
  const permissions = roleDocuments(context).find((doc) => doc.role === user.role)?.permissions;
  if (!permissions || !permissions[action]) return false;
  return permissions[action] || false;
}
