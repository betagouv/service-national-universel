import { SessionPhase1Type } from "snu-lib";
import { SejourModel } from "src/admin/core/sejours/phase1/sejour/Sejour.model";
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
            centreId: sejourDocument.cohesionCenterId,
            equipe: sejourDocument.team,
            listeAttente: sejourDocument,
            projetPedagogiqueFiles: sejourDocument.pedagoProjectFiles,
            emploiDuTempsFiles: sejourDocument.timeScheduleFiles,
            status: sejourDocument.status,
            hasTimeSchedule: sejourDocument.hasTimeSchedule,
            hasPedagoProject: sejourDocument.hasPedagoProject,
        };
    }

    static toEntity(sejourModel: SejourModel): Omit<SessionPhase1Type, "createdAt" | "updatedAt"> {
        return {
            _id: sejourModel.id,
            placesLeft: sejourModel.placesRestantes,
            placesTotal: sejourModel.placesTotal,
            cohesionCenterId: sejourModel.centreId,
            timeScheduleFiles: sejourModel.emploiDuTempsFiles,
            pedagoProjectFiles: sejourModel.projetPedagogiqueFiles,
            team: sejourModel.equipe,
            waitingList: sejourModel.listeAttente,
            status: sejourModel.status,
            hasTimeSchedule: sejourModel.hasTimeSchedule,
            hasPedagoProject: sejourModel.hasPedagoProject,
        };
    }
}
