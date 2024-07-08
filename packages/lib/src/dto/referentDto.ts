import { ROLES } from "../roles";

export type ReferentDto = {
  _id: string;
  firstName?: string;
  lastName?: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  subRole?: string;
  structureId?: string;
  phone?: string;
  email?: string;
  emailWaitingValidation?: string;
};
