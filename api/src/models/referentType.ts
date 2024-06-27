import { Document } from "mongoose";
import { ReferentCreatedBy } from "snu-lib";

export type ReferentDocument = IReferent & Document;

export interface IReferent extends Document {
  _id: string;
  sqlId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailValidatedAt: Date;
  emailWaitingValidation: string;
  password: string;
  loginAttempts: number;
  token2FA: string;
  token2FAExpires: Date;
  attempts2FA: number;
  acceptCGU: "true" | "false";
  lastLoginAt: Date;
  lastActivityAt: Date;
  lastLogoutAt: Date;
  passwordChangedAt: Date;
  registredAt: Date;
  nextLoginAttemptIn: Date;
  forgotPasswordResetToken: string;
  forgotPasswordResetExpires: Date;
  invitationToken: string;
  invitationExpires: Date;
  role: string;
  subRole: string;
  region: string;
  department: string[];
  structureId: string;
  sessionPhase1Id: string;
  cohorts: string[];
  cohesionCenterId: string;
  cohesionCenterName: string;
  phone: string;
  mobile: string;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: ReferentMetadata;
}

export interface ReferentMetadata {
  createdBy: typeof ReferentCreatedBy;
}
