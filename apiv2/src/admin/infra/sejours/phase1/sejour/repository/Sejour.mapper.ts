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
            equipe: sejourDocument.team,
            listeAttente: sejourDocument.waitingList,
            chefDeCentreReferentId: sejourDocument.headCenterId,
            centreId: sejourDocument.cohesionCenterId,
            centreVille: sejourDocument.cityCentre,
            centreCodePostal: sejourDocument.zipCentre,
            sessionName: sejourDocument.cohort,
            sessionId: sejourDocument.cohortId,
            // mandatory
            projetPedagogiqueFiles: sejourDocument.pedagoProjectFiles as any,
            emploiDuTempsFiles: sejourDocument.timeScheduleFiles as any,
            status: sejourDocument.status,
            hasTimeSchedule: sejourDocument.hasTimeSchedule,
            hasPedagoProject: sejourDocument.hasPedagoProject,
            region: sejourDocument.region,
            departement: sejourDocument.department,
            centreCode: sejourDocument.codeCentre,
            centreNom: sejourDocument.nameCentre,
        };
    }

    static toEntity(sejourModel: SejourModel): Omit<SessionPhase1Type, "createdAt" | "updatedAt"> {
        return {
            _id: sejourModel.id,
            placesLeft: sejourModel.placesRestantes,
            placesTotal: sejourModel.placesTotal,
            cohesionCenterId: sejourModel.centreId,
            timeScheduleFiles: sejourModel.emploiDuTempsFiles as any,
            pedagoProjectFiles: sejourModel.projetPedagogiqueFiles as any,
            team: sejourModel.equipe,
            waitingList: sejourModel.listeAttente,
            status: sejourModel.status,
            hasTimeSchedule: sejourModel.hasTimeSchedule,
            hasPedagoProject: sejourModel.hasPedagoProject,
        };
    }
}
