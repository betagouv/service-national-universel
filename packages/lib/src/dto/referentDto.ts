import { ROLES, SUB_ROLES, SUPPORT_ROLES_LIST, VISITOR_SUB_ROLES_LIST } from "../roles";

export type ReferentDto = {
  _id: string;
  firstName?: string;
  lastName?: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  subRole?: keyof typeof SUB_ROLES | keyof typeof SUPPORT_ROLES_LIST | keyof typeof VISITOR_SUB_ROLES_LIST | "god";
  structureId?: string;
  phone?: string;
  email?: string;
  emailWaitingValidation?: string;
};
