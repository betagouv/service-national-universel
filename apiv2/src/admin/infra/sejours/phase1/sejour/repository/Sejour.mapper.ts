import { SessionPhase1Type } from "snu-lib";
import { SejourModel } from "@admin/core/sejours/phase1/sejour/Sejour.model";
import { SejourDocument } from "../provider/SejourMongo.provider";

export class SejourMapper {
    static toModels(sejourDocuments: SejourDocument[]): SejourModel[] {
        return sejourDocuments.map((sejourDocument) => this.toModel(sejourDocument));
    }

    static toModel(sejourDocument: SejourDocument): SejourModel {
        return {
            id: sejourDocument._id.toString(),
            placesRestantes: sejourDocument.placesLeft,
            placesTotal: sejourDocument.placesTotal,
            // equipe: sejourDocument.team,
            listeAttente: sejourDocument.waitingList,
            chefDeCentreReferentId: sejourDocument.headCenterId,
            centreId: sejourDocument.cohesionCenterId,
            centreVille: sejourDocument.cityCentre,
            centreCodePostal: sejourDocument.zipCentre,
            sessionNom: sejourDocument.cohort,
            sessionId: sejourDocument.cohortId,
            // mandatory
            // projetPedagogiqueFiles: sejourDocument.pedagoProjectFiles as any,
            // emploiDuTempsFiles: sejourDocument.timeScheduleFiles as any,
            status: sejourDocument.status,
            hasTimeSchedule: sejourDocument.hasTimeSchedule,
            hasPedagoProject: sejourDocument.hasPedagoProject,
            region: sejourDocument.region,
            departement: sejourDocument.department,
            centreCode: sejourDocument.codeCentre,
            centreNom: sejourDocument.nameCentre,
            sejourSnuIds: sejourDocument.sejourSnuIds,
            adjointsIds: sejourDocument.adjointsIds,
        };
    }

    static toEntity(
        sejourModel: SejourModel,
    ): Omit<SessionPhase1Type, "createdAt" | "updatedAt" | "timeScheduleFiles" | "pedagoProjectFiles" | "team"> {
        return {
            _id: sejourModel.id,
            placesLeft: sejourModel.placesRestantes,
            placesTotal: sejourModel.placesTotal,
            cohesionCenterId: sejourModel.centreId,
            waitingList: sejourModel.listeAttente,
            status: sejourModel.status,
            hasTimeSchedule: sejourModel.hasTimeSchedule,
            hasPedagoProject: sejourModel.hasPedagoProject,
            cohort: sejourModel.sessionNom,
            cohortId: sejourModel.sessionId,
            sejourSnuIds: sejourModel.sejourSnuIds,
            adjointsIds: sejourModel.adjointsIds,
        };
    }
}
