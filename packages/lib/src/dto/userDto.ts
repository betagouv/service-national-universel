import { ROLES, SUB_ROLES, SUB_ROLE_GOD, SUPPORT_ROLES, VISITOR_SUBROLES } from "../roles";
import { PermissionDto } from "./PermissionDto";

export type UserDto = {
  _id: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  roles?: (typeof ROLES)[keyof typeof ROLES][];
  email: string;
  firstName: string;
  lastName: string;
  structureId?: string;
  region: string;
  department: string[] | string;
  subRole?: keyof typeof SUB_ROLES | keyof typeof SUPPORT_ROLES | keyof typeof VISITOR_SUBROLES | typeof SUB_ROLE_GOD;
  sessionPhase1Id?: string;
  cohesionCenterId?: string;
  // young
  meetingPointId?: string;
  cohortId?: string;
  cohort?: string;
  acceptCGU?: string;
  impersonateId?: string;
  impersonatedBy?: UserDto;
  acl?: PermissionDto[];
};
