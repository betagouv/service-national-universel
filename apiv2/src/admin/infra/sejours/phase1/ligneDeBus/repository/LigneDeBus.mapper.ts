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
            pointDeRassemblementIds: ligneDeBusDocument.meetingPointsIds,
            capaciteJeunes: ligneDeBusDocument.youngCapacity,
            placesOccupeesJeunes: ligneDeBusDocument.youngSeatsTaken,
            centreId: ligneDeBusDocument.centerId,
            numeroLigne: ligneDeBusDocument.busId,
            sessionId: ligneDeBusDocument.cohortId,
            sessionNom: ligneDeBusDocument.cohort,
            equipe: ligneDeBusDocument.team,
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
            ligneFusionneIds: ligneDeBusDocument.mergedBusIds,
        };
    }

    static toEntity(ligneDeBusModel: LigneDeBusModel): Omit<LigneBusType, "createdAt" | "updatedAt"> {
        return {
            _id: ligneDeBusModel.id,
            meetingPointsIds: ligneDeBusModel.pointDeRassemblementIds,
            youngCapacity: ligneDeBusModel.capaciteJeunes,
            youngSeatsTaken: ligneDeBusModel.placesOccupeesJeunes,
            centerId: ligneDeBusModel.centreId,
            busId: ligneDeBusModel.numeroLigne,
            cohort: ligneDeBusModel.sessionNom!,
            cohortId: ligneDeBusModel.sessionId,
            team: ligneDeBusModel.equipe,
            sessionId: ligneDeBusModel.sejourId!,
            totalCapacity: ligneDeBusModel.capaciteTotal,
            followerCapacity: ligneDeBusModel.capaciteAccompagnateurs,
            travelTime: ligneDeBusModel.dureeTrajet,
            centerArrivalTime: ligneDeBusModel.heureArriveeCentre,
            centerDepartureTime: ligneDeBusModel.heureDepartCentre,
            delayedForth: ligneDeBusModel.tempsRetardDepart,
            delayedBack: ligneDeBusModel.tempsRetardRetour,
            departuredDate: ligneDeBusModel.dateDepart,
            returnDate: ligneDeBusModel.dateRetour,
            mergedBusIds: ligneDeBusModel.ligneFusionneIds,
        };
    }
}
