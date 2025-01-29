import { ModificationBusType } from "snu-lib";

import { DemandeModificationLigneDeBusModel } from "@admin/core/sejours/phase1/demandeModificationLigneDeBus/DemandeModificationLigneDeBus.model";

import { DemandeModificationLigneDeBusDocument } from "../provider/DemandeModificationLigneDeBusMongo.provider";

export class DemandeModificationLigneDeBusMapper {
    static toModels(
        demandeModificationLigneDeBusDocuments: DemandeModificationLigneDeBusDocument[],
    ): DemandeModificationLigneDeBusModel[] {
        return demandeModificationLigneDeBusDocuments.map((demandeModificationLigneDeBusDocument) =>
            this.toModel(demandeModificationLigneDeBusDocument),
        );
    }

    static toModel(
        demandeModificationLigneDeBusDocument: DemandeModificationLigneDeBusDocument,
    ): DemandeModificationLigneDeBusModel {
        return {
            id: demandeModificationLigneDeBusDocument._id.toString(),
            sessionNom: demandeModificationLigneDeBusDocument.cohort,
            sessionId: demandeModificationLigneDeBusDocument.cohortId,
            ligneDeBusId: demandeModificationLigneDeBusDocument.lineId,
            numeroLigne: demandeModificationLigneDeBusDocument.lineName,
            messageDemande: demandeModificationLigneDeBusDocument.requestMessage,
            idUtilisateurDemande: demandeModificationLigneDeBusDocument.requestUserId,
            nomUtilisateurDemande: demandeModificationLigneDeBusDocument.requestUserName,
            roleUtilisateurDemande: demandeModificationLigneDeBusDocument.requestUserRole,
            idsTags: demandeModificationLigneDeBusDocument.tagIds,
            statut: demandeModificationLigneDeBusDocument.status,
            idUtilisateurStatut: demandeModificationLigneDeBusDocument.statusUserId,
            nomUtilisateurStatut: demandeModificationLigneDeBusDocument.statusUserName,
            dateStatut: demandeModificationLigneDeBusDocument.statusDate,
            avis: demandeModificationLigneDeBusDocument.opinion,
            idUtilisateurAvis: demandeModificationLigneDeBusDocument.opinionUserId,
            nomUtilisateurAvis: demandeModificationLigneDeBusDocument.opinionUserName,
            dateAvis: demandeModificationLigneDeBusDocument.opinionDate,
        };
    }

    static toEntity(
        demandeModificationLigneDeBusModel: DemandeModificationLigneDeBusModel,
    ): Omit<ModificationBusType, "createdAt" | "updatedAt" | "messages"> {
        return {
            _id: demandeModificationLigneDeBusModel.id,
            cohort: demandeModificationLigneDeBusModel.sessionNom,
            cohortId: demandeModificationLigneDeBusModel.sessionId,
            lineId: demandeModificationLigneDeBusModel.ligneDeBusId,
            lineName: demandeModificationLigneDeBusModel.numeroLigne,
            requestMessage: demandeModificationLigneDeBusModel.messageDemande,
            requestUserId: demandeModificationLigneDeBusModel.idUtilisateurDemande,
            requestUserName: demandeModificationLigneDeBusModel.nomUtilisateurDemande,
            requestUserRole: demandeModificationLigneDeBusModel.roleUtilisateurDemande,
            tagIds: demandeModificationLigneDeBusModel.idsTags,
            status: demandeModificationLigneDeBusModel.statut,
            statusUserId: demandeModificationLigneDeBusModel.idUtilisateurStatut,
            statusUserName: demandeModificationLigneDeBusModel.nomUtilisateurStatut,
            statusDate: demandeModificationLigneDeBusModel.dateStatut,
            opinion: demandeModificationLigneDeBusModel.avis,
            opinionUserId: demandeModificationLigneDeBusModel.idUtilisateurAvis,
            opinionUserName: demandeModificationLigneDeBusModel.nomUtilisateurAvis,
            opinionDate: demandeModificationLigneDeBusModel.dateAvis,
        };
    }
}
