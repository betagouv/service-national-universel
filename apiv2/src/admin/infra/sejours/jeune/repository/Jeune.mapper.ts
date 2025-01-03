import { YoungType } from "snu-lib";

import { JeuneModel } from "../../../../core/sejours/jeune/Jeune.model";
import { JeuneDocument } from "../provider/JeuneMongo.provider";

export class JeuneMapper {
    static toModels(jeuneDocuments: JeuneDocument[]): JeuneModel[] {
        return jeuneDocuments.map((jeuneDocument) => this.toModel(jeuneDocument));
    }

    static toModel(jeuneDocument: JeuneDocument): JeuneModel {
        return {
            id: jeuneDocument._id.toString(),
            statusPhase1: jeuneDocument.statusPhase1,
            centreId: jeuneDocument.cohesionCenterId,
            handicapMemeDepartment: jeuneDocument.handicapInSameDepartment,
            genre: jeuneDocument.gender,
            qpv: jeuneDocument.qpv,
            psh: jeuneDocument.handicap,
            departement: jeuneDocument.department,
            region: jeuneDocument.region,
            pointDeRassemblementId: jeuneDocument.meetingPointId,
            ligneDeBusId: jeuneDocument.ligneId,
            sessionId: jeuneDocument.cohortId,
            sessionNom: jeuneDocument.cohort,
            prenom: jeuneDocument.firstName,
            nom: jeuneDocument.lastName,
            // mandatory
            cniFiles: jeuneDocument.cniFiles,
            highSkilledActivityProofFiles: jeuneDocument.highSkilledActivityProofFiles,
            parentConsentmentFiles: jeuneDocument.parentConsentmentFiles,
            autoTestPCRFiles: jeuneDocument.autoTestPCRFiles,
            imageRightFiles: jeuneDocument.imageRightFiles,
            dataProcessingConsentmentFiles: jeuneDocument.dataProcessingConsentmentFiles,
            rulesFiles: jeuneDocument.rulesFiles,
            militaryPreparationFilesIdentity: jeuneDocument.militaryPreparationFilesIdentity,
            militaryPreparationFilesCensus: jeuneDocument.militaryPreparationFilesCensus,
            militaryPreparationFilesAuthorization: jeuneDocument.militaryPreparationFilesAuthorization,
            militaryPreparationFilesCertificate: jeuneDocument.militaryPreparationFilesCertificate,
            domains: jeuneDocument.domains,
            periodRanking: jeuneDocument.periodRanking,
            mobilityTransport: jeuneDocument.mobilityTransport,
            notes: jeuneDocument.notes,
            statusPhase2Contract: jeuneDocument.statusPhase2Contract,
            historic: jeuneDocument.historic,
            phase2ApplicationStatus: jeuneDocument.phase2ApplicationStatus,
            phase2ApplicationFilesType: jeuneDocument.phase2ApplicationFilesType,
            missionsInMail: jeuneDocument.missionsInMail,
            status: jeuneDocument.status,
            email: jeuneDocument.email,
            loginAttempts: jeuneDocument.loginAttempts,
            token2FA: jeuneDocument.token2FA,
            attempts2FA: jeuneDocument.attempts2FA,
            lastLoginAt: jeuneDocument.lastLoginAt,
            forgotPasswordResetToken: jeuneDocument.forgotPasswordResetToken,
            acceptCGU: jeuneDocument.acceptCGU,
            invitationToken: jeuneDocument.invitationToken,
            phase: jeuneDocument.phase,
            statusPhase2: jeuneDocument.statusPhase2,
            statusPhase3: jeuneDocument.statusPhase3,
            lastStatusAt: jeuneDocument.lastStatusAt,
            hasStartedReinscription: jeuneDocument.hasStartedReinscription,
            cohesion2020Step: jeuneDocument.cohesion2020Step,
            tokenEmailValidation: jeuneDocument.tokenEmailValidation,
            attemptsEmailValidation: jeuneDocument.attemptsEmailValidation,
            cohesionStayMedicalFileDownload: jeuneDocument.cohesionStayMedicalFileDownload,
            convocationFileDownload: jeuneDocument.convocationFileDownload,
            source: jeuneDocument.source,
            phase3Token: jeuneDocument.phase3Token,
            parent1FromFranceConnect: jeuneDocument.parent1FromFranceConnect,
            parent2FromFranceConnect: jeuneDocument.parent2FromFranceConnect,
            imageRightFilesStatus: jeuneDocument.imageRightFilesStatus,
            autoTestPCRFilesStatus: jeuneDocument.autoTestPCRFilesStatus,
            youngPhase1Agreement: jeuneDocument.youngPhase1Agreement,
            hasNotes: jeuneDocument.hasNotes,
        };
    }

    static toEntity(jeuneModel: JeuneModel): Omit<YoungType, "metadata" | "createdAt" | "updatedAt"> {
        return {
            _id: jeuneModel.id,
            statusPhase1: jeuneModel.statusPhase1,
            cohesionCenterId: jeuneModel.centreId,
            handicapInSameDepartment: jeuneModel.handicapMemeDepartment,
            gender: jeuneModel.genre,
            qpv: jeuneModel.qpv,
            handicap: jeuneModel.psh,
            department: jeuneModel.departement,
            region: jeuneModel.region,
            meetingPointId: jeuneModel.pointDeRassemblementId,
            ligneId: jeuneModel.ligneDeBusId,
            cohortId: jeuneModel.sessionId,
            cohort: jeuneModel.sessionNom,
            firstName: jeuneModel.prenom,
            lastName: jeuneModel.nom,
            // mandatory
            cniFiles: jeuneModel.cniFiles,
            highSkilledActivityProofFiles: jeuneModel.highSkilledActivityProofFiles,
            parentConsentmentFiles: jeuneModel.parentConsentmentFiles,
            autoTestPCRFiles: jeuneModel.autoTestPCRFiles,
            imageRightFiles: jeuneModel.imageRightFiles,
            dataProcessingConsentmentFiles: jeuneModel.dataProcessingConsentmentFiles,
            rulesFiles: jeuneModel.rulesFiles,
            militaryPreparationFilesIdentity: jeuneModel.militaryPreparationFilesIdentity,
            militaryPreparationFilesCensus: jeuneModel.militaryPreparationFilesCensus,
            militaryPreparationFilesAuthorization: jeuneModel.militaryPreparationFilesAuthorization,
            militaryPreparationFilesCertificate: jeuneModel.militaryPreparationFilesCertificate,
            domains: jeuneModel.domains,
            periodRanking: jeuneModel.periodRanking,
            mobilityTransport: jeuneModel.mobilityTransport,
            notes: jeuneModel.notes,
            statusPhase2Contract: jeuneModel.statusPhase2Contract,
            historic: jeuneModel.historic,
            phase2ApplicationStatus: jeuneModel.phase2ApplicationStatus,
            phase2ApplicationFilesType: jeuneModel.phase2ApplicationFilesType,
            missionsInMail: jeuneModel.missionsInMail,
            status: jeuneModel.status,
            email: jeuneModel.email,
            loginAttempts: jeuneModel.loginAttempts,
            token2FA: jeuneModel.token2FA,
            attempts2FA: jeuneModel.attempts2FA,
            lastLoginAt: jeuneModel.lastLoginAt,
            forgotPasswordResetToken: jeuneModel.forgotPasswordResetToken,
            acceptCGU: jeuneModel.acceptCGU,
            invitationToken: jeuneModel.invitationToken,
            phase: jeuneModel.phase,
            statusPhase2: jeuneModel.statusPhase2,
            statusPhase3: jeuneModel.statusPhase3,
            lastStatusAt: jeuneModel.lastStatusAt,
            hasStartedReinscription: jeuneModel.hasStartedReinscription,
            cohesion2020Step: jeuneModel.cohesion2020Step,
            tokenEmailValidation: jeuneModel.tokenEmailValidation,
            attemptsEmailValidation: jeuneModel.attemptsEmailValidation,
            cohesionStayMedicalFileDownload: jeuneModel.cohesionStayMedicalFileDownload,
            convocationFileDownload: jeuneModel.convocationFileDownload,
            source: jeuneModel.source,
            phase3Token: jeuneModel.phase3Token,
            parent1FromFranceConnect: jeuneModel.parent1FromFranceConnect,
            parent2FromFranceConnect: jeuneModel.parent2FromFranceConnect,
            imageRightFilesStatus: jeuneModel.imageRightFilesStatus,
            autoTestPCRFilesStatus: jeuneModel.autoTestPCRFilesStatus,
            youngPhase1Agreement: jeuneModel.youngPhase1Agreement,
            hasNotes: jeuneModel.hasNotes,
        };
    }
}
