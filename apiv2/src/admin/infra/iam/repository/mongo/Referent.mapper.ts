import {
    CreateReferentModel,
    ReferentMetadataModel,
    ReferentModel,
    ReferentPasswordModel,
} from "@admin/core/iam/Referent.model";
import { ReferentType } from "snu-lib";
import { ReferentDocument } from "../../provider/ReferentMongo.provider";

export class ReferentMapper {
    static toModels(referentDocuments: ReferentDocument[]): ReferentModel[] {
        return referentDocuments.map((referentDocument) => this.toModel(referentDocument));
    }

    static toModelWithPassword(referentDocument: ReferentDocument): ReferentPasswordModel {
        return { ...this.toModel(referentDocument), password: referentDocument.password };
    }

    static toModel(referentDocument: ReferentDocument): ReferentModel {
        return {
            id: referentDocument._id.toString(),
            prenom: referentDocument.firstName,
            nom: referentDocument.lastName,
            role: referentDocument.role,
            sousRole: referentDocument.subRole,
            email: referentDocument.email,
            departement: referentDocument.department,
            region: referentDocument.region,
            telephone: referentDocument.phone,
            metadata: this.toMetadataModel(referentDocument.metadata),
            invitationToken: referentDocument.invitationToken,
            invitationExpires: referentDocument.invitationExpires,
            nomComplet: `${referentDocument.firstName} ${referentDocument.lastName}`,
            structureId: referentDocument.structureId,
            sessionPhase1Id: referentDocument.sessionPhase1Id,
            cohorts: referentDocument.cohorts,
            cohortIds: referentDocument.cohortIds,
            cohesionCenterId: referentDocument.cohesionCenterId,
            cohesionCenterName: referentDocument.cohesionCenterName,
            mobile: referentDocument.mobile,
            acceptCGU: referentDocument.acceptCGU === "true" ? true : false,
            lastLogoutAt: referentDocument.lastLogoutAt,
            passwordChangedAt: referentDocument.passwordChangedAt, // required by jwt_token v1

            // used by usecase or frontend ?
            // lastLoginAt: referentDocument.lastLoginAt,
            // lastActivityAt: referentDocument.lastActivityAt,
            // emailValidatedAt: referentDocument.emailValidatedAt,
            // emailWaitingValidation: referentDocument.emailWaitingValidation,
            // loginAttempts: referentDocument.loginAttempts,
            // token2FA: referentDocument.token2FA,
            // token2FAExpires: referentDocument.token2FAExpires,
            // attempts2FA: referentDocument.attempts2FA,
            // registredAt: referentDocument.registredAt,
            // nextLoginAttemptIn: referentDocument.nextLoginAttemptIn,
            // forgotPasswordResetToken: referentDocument.forgotPasswordResetToken,
            // forgotPasswordResetExpires: referentDocument.forgotPasswordResetExpires,

            deletedAt: referentDocument.deletedAt,
            createdAt: referentDocument.createdAt,
            updatedAt: referentDocument.updatedAt,
        };
    }

    static toModelWithoutPassword(referentPasswordModel: ReferentPasswordModel): ReferentModel {
        const { password, ...referentModel } = referentPasswordModel;
        return referentModel;
    }

    static toEntityCreate(referentModel: CreateReferentModel): Omit<ReferentType, "_id"> {
        return {
            firstName: referentModel.prenom,
            lastName: referentModel.nom,
            role: referentModel.role,
            subRole: referentModel.sousRole,
            email: referentModel.email,
            // @ts-expect-error 2322 due to mongoose schema inference
            department: referentModel.departement,
            region: referentModel.region,
            metadata: referentModel.metadata,
            phone: referentModel.telephone,
            invitationToken: referentModel.invitationToken,
            invitationExpires: referentModel.invitationExpires,
            acceptCGU: referentModel.acceptCGU ? "true" : "false",
            lastLogoutAt: referentModel.lastLogoutAt,
            passwordChangedAt: referentModel.passwordChangedAt, // required by jwt_token v1

            // update from usecase ?
            // lastLoginAt: referentModel.lastLoginAt,
            // lastActivityAt: referentModel.lastActivityAt,
            // emailValidatedAt: referentModel.emailValidatedAt,
            // emailWaitingValidation: referentModel.emailWaitingValidation,
            // loginAttempts: referentModel.loginAttempts,
            // token2FA: referentModel.token2FA,
            // token2FAExpires: referentModel.token2FAExpires,
            // attempts2FA: referentModel.attempts2FA,
            // registredAt: referentModel.registredAt,
            // nextLoginAttemptIn: referentModel.nextLoginAttemptIn,
            // forgotPasswordResetToken: referentModel.forgotPasswordResetToken,
        };
    }
    static toEntity(referentModel: ReferentModel): ReferentType {
        return {
            _id: referentModel.id,
            ...this.toEntityCreate(referentModel),
        };
    }

    private static toMetadataModel(metadata: ReferentType["metadata"]): ReferentMetadataModel {
        return {
            // TODO : improve mongoose inference type
            // @ts-expect-error 2322 due to mongoose schema inference
            invitationType: metadata?.invitationType,
            isFirstInvitationPending: metadata?.isFirstInvitationPending,
        };
    }
}
