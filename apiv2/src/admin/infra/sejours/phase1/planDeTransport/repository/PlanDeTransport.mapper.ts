import { PlanDeTransportModel } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.model";
import { PlanDeTransportDocument } from "../provider/PlanDeTransportMongo.provider";
import { PlanTransportType } from "snu-lib";

export class PlanDeTransportMapper {
    static toModels(planDeTransportDocuments: PlanDeTransportDocument[]): PlanDeTransportModel[] {
        return planDeTransportDocuments.map((planDeTransportDocument) => this.toModel(planDeTransportDocument));
    }

    static toModel(planDeTransportDocument: PlanDeTransportDocument): PlanDeTransportModel {
        return {
            id: planDeTransportDocument._id.toString(),
            capaciteJeunes: planDeTransportDocument.youngCapacity,
            placesOccupeesJeunes: planDeTransportDocument.youngSeatsTaken,
            centreId: planDeTransportDocument.centerId,
            numeroLigne: planDeTransportDocument.busId,
            sessionId: planDeTransportDocument.cohortId,
            sessionNom: planDeTransportDocument.cohort,
            capaciteTotal: planDeTransportDocument.totalCapacity,
            capaciteAccompagnateurs: planDeTransportDocument.followerCapacity,
            dureeTrajet: planDeTransportDocument.travelTime,
            heureArriveeCentre: planDeTransportDocument.centerArrivalTime,
            heureDepartCentre: planDeTransportDocument.centerDepartureTime,
            tempsRetardDepart: planDeTransportDocument.delayedForth,
            tempsRetardRetour: planDeTransportDocument.delayedBack,
            dateDepart: planDeTransportDocument.departureString,
            dateRetour: planDeTransportDocument.returnString,
            centreRegion: planDeTransportDocument.centerRegion,
            centreDepartement: planDeTransportDocument.centerDepartment,
            centreAdresse: planDeTransportDocument.centerAddress,
            centreCodePostal: planDeTransportDocument.centerZip,
            centreNom: planDeTransportDocument.centerName,
            centreCode: planDeTransportDocument.centerCode,
            ligneFusionneIds: planDeTransportDocument.mergedBusIds,
            ligneMirroirId: planDeTransportDocument.mirrorBusId,
        };
    }

    static toEntity(
        planDeTransportModel: PlanDeTransportModel,
    ): Omit<PlanTransportType, "pointDeRassemblements" | "modificationBuses" | "createdAt" | "updatedAt"> {
        return {
            _id: planDeTransportModel.id,
            youngCapacity: planDeTransportModel.capaciteJeunes,
            youngSeatsTaken: planDeTransportModel.placesOccupeesJeunes,
            centerId: planDeTransportModel.centreId,
            busId: planDeTransportModel.numeroLigne,
            cohort: planDeTransportModel.sessionNom!,
            cohortId: planDeTransportModel.sessionId,
            totalCapacity: planDeTransportModel.capaciteTotal,
            followerCapacity: planDeTransportModel.capaciteAccompagnateurs,
            travelTime: planDeTransportModel.dureeTrajet,
            centerArrivalTime: planDeTransportModel.heureArriveeCentre,
            centerDepartureTime: planDeTransportModel.heureDepartCentre,
            delayedForth: planDeTransportModel.tempsRetardDepart,
            delayedBack: planDeTransportModel.tempsRetardRetour,
            departureString: planDeTransportModel.dateDepart,
            returnString: planDeTransportModel.dateRetour,
            centerRegion: planDeTransportModel.centreRegion,
            centerDepartment: planDeTransportModel.centreDepartement,
            centerAddress: planDeTransportModel.centreAdresse,
            centerZip: planDeTransportModel.centreCodePostal,
            centerName: planDeTransportModel.centreNom,
            centerCode: planDeTransportModel.centreCode,
            mergedBusIds: planDeTransportModel.ligneFusionneIds,
            mirrorBusId: planDeTransportModel.ligneMirroirId,
            // TODO: map pointDeRassemblements...
        };
    }
}
