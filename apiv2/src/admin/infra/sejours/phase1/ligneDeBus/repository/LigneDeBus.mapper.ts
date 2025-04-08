import { LigneDeBusModel } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";
import { LigneDeBusDocument } from "../provider/LigneDeBusMongo.provider";
import { LigneBusType } from "snu-lib";

export class LigneDeBusMapper {
    static toModels(ligneDeBusDocuments: LigneDeBusDocument[]): LigneDeBusModel[] {
        return ligneDeBusDocuments.map((ligneDeBusDocument) => this.toModel(ligneDeBusDocument));
    }

    static toModel(ligneDeBusDocument: LigneDeBusDocument): LigneDeBusModel {
        return {
            id: ligneDeBusDocument._id.toString(),
            codeCourtDeRoute: ligneDeBusDocument.codeCourtDeRoute,
            pointDeRassemblementIds: ligneDeBusDocument.meetingPointsIds,
            capaciteJeunes: ligneDeBusDocument.youngCapacity,
            placesOccupeesJeunes: ligneDeBusDocument.youngSeatsTaken,
            centreId: ligneDeBusDocument.centerId,
            numeroLigne: ligneDeBusDocument.busId,
            sessionId: ligneDeBusDocument.cohortId,
            sessionNom: ligneDeBusDocument.cohort,
            sejourId: ligneDeBusDocument.sessionId,
            capaciteTotal: ligneDeBusDocument.totalCapacity,
            capaciteAccompagnateurs: ligneDeBusDocument.followerCapacity,
            dureeTrajet: ligneDeBusDocument.travelTime,
            heureArriveeCentre: ligneDeBusDocument.centerArrivalTime,
            heureDepartCentre: ligneDeBusDocument.centerDepartureTime,
            tempsRetardDepart: ligneDeBusDocument.delayedForth,
            tempsRetardRetour: ligneDeBusDocument.delayedBack,
            dateDepart: ligneDeBusDocument.departuredDate,
            dateRetour: ligneDeBusDocument.returnDate,
            ligneFusionneeNumerosLignes: ligneDeBusDocument.mergedBusIds,
            ligneMiroirNumeroLigne: ligneDeBusDocument.mirrorBusId,
        };
    }

    static toEntity(ligneDeBusModel: LigneDeBusModel): Omit<LigneBusType, "createdAt" | "updatedAt" | "team"> {
        return {
            _id: ligneDeBusModel.id,
            codeCourtDeRoute: ligneDeBusModel.codeCourtDeRoute,
            meetingPointsIds: ligneDeBusModel.pointDeRassemblementIds,
            youngCapacity: ligneDeBusModel.capaciteJeunes,
            youngSeatsTaken: ligneDeBusModel.placesOccupeesJeunes,
            centerId: ligneDeBusModel.centreId,
            busId: ligneDeBusModel.numeroLigne,
            cohort: ligneDeBusModel.sessionNom!,
            cohortId: ligneDeBusModel.sessionId,
            sessionId: ligneDeBusModel.sejourId,
            totalCapacity: ligneDeBusModel.capaciteTotal,
            followerCapacity: ligneDeBusModel.capaciteAccompagnateurs,
            travelTime: ligneDeBusModel.dureeTrajet,
            centerArrivalTime: ligneDeBusModel.heureArriveeCentre,
            centerDepartureTime: ligneDeBusModel.heureDepartCentre,
            delayedForth: ligneDeBusModel.tempsRetardDepart,
            delayedBack: ligneDeBusModel.tempsRetardRetour,
            departuredDate: ligneDeBusModel.dateDepart,
            returnDate: ligneDeBusModel.dateRetour,
            mergedBusIds: ligneDeBusModel.ligneFusionneeNumerosLignes,
            mirrorBusId: ligneDeBusModel.ligneMiroirNumeroLigne,
        };
    }
}
