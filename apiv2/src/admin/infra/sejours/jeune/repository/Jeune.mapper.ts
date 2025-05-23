import { YOUNG_SOURCE, YoungType } from "snu-lib";

import { JeuneModel } from "../../../../core/sejours/jeune/Jeune.model";
import { JeuneDocument } from "../provider/JeuneMongo.provider";

export class JeuneMapper {
    static toModels(jeuneDocuments: JeuneDocument[]): JeuneModel[] {
        return jeuneDocuments.map((jeuneDocument) => this.toModel(jeuneDocument));
    }

    static toModel(jeuneDocument: JeuneDocument): JeuneModel {
        return {
            id: jeuneDocument._id.toString(),
            statut: jeuneDocument.status,
            statutPhase1: jeuneDocument.statusPhase1,
            statutCompte: jeuneDocument.accountStatus,
            email: jeuneDocument.email,
            dateNaissance: jeuneDocument.birthdateAt,
            telephone: jeuneDocument.phone,
            centreId: jeuneDocument.cohesionCenterId,
            handicapMemeDepartement: jeuneDocument.handicapInSameDepartment,
            genre: jeuneDocument.gender,
            qpv: jeuneDocument.qpv,
            psh: jeuneDocument.handicap,
            departement: jeuneDocument.department,
            region: jeuneDocument.region,
            localisation: jeuneDocument.location,
            departementScolarite: jeuneDocument.schoolDepartment,
            regionScolarite: jeuneDocument.schoolRegion,
            paysScolarite: jeuneDocument.schoolCountry,
            pointDeRassemblementId: jeuneDocument.meetingPointId,
            ligneDeBusId: jeuneDocument.ligneId,
            sejourId: jeuneDocument.sessionPhase1Id,
            hasPDR: jeuneDocument.hasMeetingInformation,
            sessionId: jeuneDocument.cohortId,
            sessionNom: jeuneDocument.cohort,
            originalSessionId: jeuneDocument.originalCohortId,
            originalSessionNom: jeuneDocument.originalCohort,
            prenom: jeuneDocument.firstName,
            nom: jeuneDocument.lastName,
            deplacementPhase1Autonomous: jeuneDocument.deplacementPhase1Autonomous,
            transportInfoGivenByLocal: jeuneDocument.transportInfoGivenByLocal,
            presenceArrivee: jeuneDocument.cohesionStayPresence,
            presenceJDM: jeuneDocument.presenceJDM,
            departInform: jeuneDocument.departInform,
            departSejourMotif: jeuneDocument.departSejourMotif,
            departSejourMotifComment: jeuneDocument.departSejourMotifComment,
            desistementMotif: jeuneDocument.withdrawnReason,
            desistementMessage: jeuneDocument.withdrawnMessage,
            niveauScolaire: jeuneDocument.grade,
            scolarise: jeuneDocument.schooled,
            codePostal: jeuneDocument.zip,
            source: jeuneDocument.source,
            consentement: jeuneDocument.consentment,
            imageRight: jeuneDocument.imageRight,
            acceptCGU: jeuneDocument.acceptCGU,
            parentAllowSNU: jeuneDocument.parentAllowSNU,
            // Parent 1 Information
            parent1Prenom: jeuneDocument.parent1FirstName,
            parent1Nom: jeuneDocument.parent1LastName,
            parent1Email: jeuneDocument.parent1Email,
            parent1Telephone: jeuneDocument.parent1Phone,
            parent1AllowSNU: jeuneDocument.parent1AllowSNU,
            parent1AllowImageRights: jeuneDocument.parent1AllowImageRights,
            // Parent 2 Information
            parent2Prenom: jeuneDocument.parent2FirstName,
            parent2Nom: jeuneDocument.parent2LastName,
            parent2Email: jeuneDocument.parent2Email,
            parent2Telephone: jeuneDocument.parent2Phone,
            youngPhase1Agreement: jeuneDocument.youngPhase1Agreement,
            sessionChangeReason: jeuneDocument.cohortChangeReason,
            // CLE
            classeId: jeuneDocument.classeId,
            etablissementId: jeuneDocument.etablissementId,
        };
    }

    static toEntity(
        jeuneModel: JeuneModel,
    ): Omit<
        YoungType,
        | "metadata"
        | "createdAt"
        | "updatedAt"
        | "cniFiles"
        | "highSkilledActivityProofFiles"
        | "parentConsentmentFiles"
        | "autoTestPCRFiles"
        | "imageRightFiles"
        | "dataProcessingConsentmentFiles"
        | "rulesFiles"
        | "militaryPreparationFilesIdentity"
        | "militaryPreparationFilesCensus"
        | "militaryPreparationFilesAuthorization"
        | "militaryPreparationFilesCertificate"
        | "domains"
        | "periodRanking"
        | "mobilityTransport"
        | "notes"
        | "statusPhase2Contract"
        | "historic"
        | "phase2ApplicationStatus"
        | "phase2ApplicationFilesType"
        | "missionsInMail"
        | "loginAttempts"
        | "token2FA"
        | "attempts2FA"
        | "lastLoginAt"
        | "forgotPasswordResetToken"
        | "invitationToken"
        | "phase"
        | "statusPhase2"
        | "statusPhase3"
        | "lastStatusAt"
        | "hasStartedReinscription"
        | "cohesion2020Step"
        | "tokenEmailValidation"
        | "attemptsEmailValidation"
        | "cohesionStayMedicalFileDownload"
        | "convocationFileDownload"
        | "phase3Token"
        | "parent1FromFranceConnect"
        | "parent2FromFranceConnect"
        | "imageRightFilesStatus"
        | "autoTestPCRFilesStatus"
        | "hasNotes"
    > {
        return {
            _id: jeuneModel.id,
            status: jeuneModel.statut,
            statusPhase1: jeuneModel.statutPhase1,
            accountStatus: jeuneModel.statutCompte,
            email: jeuneModel.email,
            birthdateAt: jeuneModel.dateNaissance,
            phone: jeuneModel.telephone,
            cohesionCenterId: jeuneModel.centreId,
            handicapInSameDepartment: jeuneModel.handicapMemeDepartement,
            gender: jeuneModel.genre,
            qpv: jeuneModel.qpv,
            handicap: jeuneModel.psh,
            department: jeuneModel.departement,
            region: jeuneModel.region,
            location: jeuneModel.localisation,
            schoolDepartment: jeuneModel.departementScolarite,
            schoolRegion: jeuneModel.regionScolarite,
            schoolCountry: jeuneModel.paysScolarite,
            meetingPointId: jeuneModel.pointDeRassemblementId,
            ligneId: jeuneModel.ligneDeBusId,
            sessionPhase1Id: jeuneModel.sejourId,
            hasMeetingInformation: jeuneModel.hasPDR,
            cohortId: jeuneModel.sessionId,
            cohort: jeuneModel.sessionNom,
            originalCohortId: jeuneModel.originalSessionId,
            originalCohort: jeuneModel.originalSessionNom,
            firstName: jeuneModel.prenom,
            lastName: jeuneModel.nom,
            deplacementPhase1Autonomous: jeuneModel.deplacementPhase1Autonomous,
            transportInfoGivenByLocal: jeuneModel.transportInfoGivenByLocal,
            cohesionStayPresence: jeuneModel.presenceArrivee,
            presenceJDM: jeuneModel.presenceJDM,
            departInform: jeuneModel.departInform,
            source: jeuneModel.source || YOUNG_SOURCE.VOLONTAIRE,
            consentment: jeuneModel.consentement,
            imageRight: jeuneModel.imageRight,
            acceptCGU: jeuneModel.acceptCGU || "",
            parentAllowSNU: jeuneModel.parentAllowSNU,
            // departSejourAt: jeuneModel.departSejourAt,
            departSejourMotif: jeuneModel.departSejourMotif,
            departSejourMotifComment: jeuneModel.departSejourMotifComment,
            withdrawnReason: jeuneModel.desistementMotif,
            withdrawnMessage: jeuneModel.desistementMessage,
            grade: jeuneModel.niveauScolaire,
            schooled: jeuneModel.scolarise,
            zip: jeuneModel.codePostal,
            // Parent 1 Information
            parent1FirstName: jeuneModel.parent1Prenom,
            parent1LastName: jeuneModel.parent1Nom,
            parent1Email: jeuneModel.parent1Email,
            parent1Phone: jeuneModel.parent1Telephone,
            parent1AllowSNU: jeuneModel.parent1AllowSNU,
            parent1AllowImageRights: jeuneModel.parent1AllowImageRights,
            // Parent 2 Information
            parent2FirstName: jeuneModel.parent2Prenom,
            parent2LastName: jeuneModel.parent2Nom,
            parent2Email: jeuneModel.parent2Email,
            parent2Phone: jeuneModel.parent2Telephone,
            youngPhase1Agreement: jeuneModel.youngPhase1Agreement,
            cohortChangeReason: jeuneModel.sessionChangeReason,
            // CLE
            classeId: jeuneModel.classeId,
            etablissementId: jeuneModel.etablissementId,
        };
    }
}
