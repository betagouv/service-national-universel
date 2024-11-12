import { InvitationType } from "snu-lib";

export interface ReferentModel {
    id: string;
    nom?: string;
    prenom?: string;
    role?: string;
    sousRole?: string;
    email: string;
    departement?: string[];
    region: string;

    metadata: ReferentMetadataModel;
    telephone?: string;
    mobile?: string;
    invitationToken: string;
    invitationExpires?: Date;
    nomComplet?: string;
    structureId?: string;
    sessionPhase1Id?: string;
    cohorts?: string[];
    cohortIds?: string[];
    cohesionCenterId?: string;
    cohesionCenterName?: string;
    acceptCGU?: boolean;
    lastLogoutAt?: Date;

    // used by usecase or frontend ?
    // lastLoginAt?: Date;
    // lastActivityAt?: Date;
    // emailValidatedAt?: Date;
    // emailWaitingValidation?: string;
    // loginAttempts: number;
    // token2FA?: string;
    // token2FAExpires?: Date;
    // attempts2FA?: number;
    // passwordChangedAt?: Date;
    // registredAt?: Date;
    // nextLoginAttemptIn?: Date;
    // forgotPasswordResetToken?: string;
    // forgotPasswordResetExpires?: Date;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ReferentPasswordModel extends ReferentModel {
    password?: string;
}

export class ReferentMetadataModel {
    invitationType?: InvitationType;
    isFirstInvitationPending?: boolean;
}
