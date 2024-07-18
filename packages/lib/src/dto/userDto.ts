import { SUB_ROLES, SUPPORT_ROLES_LIST, VISITOR_SUB_ROLES_LIST } from "../roles";

export type UserDto = {
  _id: string;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  structureId: string;
  region: string;
  departement: string;
  subRole: keyof typeof SUB_ROLES | keyof typeof SUPPORT_ROLES_LIST | keyof typeof VISITOR_SUB_ROLES_LIST;
};
