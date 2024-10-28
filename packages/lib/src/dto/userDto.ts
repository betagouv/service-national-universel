import { ROLES, SUB_ROLES, SUB_ROLE_GOD, SUPPORT_ROLES_LIST, VISITOR_SUB_ROLES_LIST } from "../roles";

export type UserDto = {
  _id: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  email: string;
  firstName: string;
  lastName: string;
  structureId: string;
  region: string;
  department: string[] | string;
  subRole?: keyof typeof SUB_ROLES | keyof typeof SUPPORT_ROLES_LIST | keyof typeof VISITOR_SUB_ROLES_LIST | typeof SUB_ROLE_GOD;
  sessionPhase1Id?: string;
  // young
  meetingPointId?: string;
  cohort?: string;
};
