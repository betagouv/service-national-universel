import { ROLES, SUB_ROLE_GOD, SUB_ROLES, SUPPORT_ROLES, VISITOR_SUBROLES } from "../roles";

export type ReferentDto = {
  _id: string;
  firstName?: string;
  lastName?: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  subRole?: keyof typeof SUB_ROLES | keyof typeof SUPPORT_ROLES | keyof typeof VISITOR_SUBROLES | typeof SUB_ROLE_GOD;
  structureId?: string;
  phone?: string;
  email?: string;
  emailWaitingValidation?: string;
};
