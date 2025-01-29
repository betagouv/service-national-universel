import { LigneToPointType } from "snu-lib";

import { SegmentDeLigneModel } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.model";

import { SegmentDeLigneDocument } from "../provider/SegmentDeLigneMongo.provider";

export class SegmentDeLigneMapper {
    static toModels(segmentLigneDocuments: SegmentDeLigneDocument[]): SegmentDeLigneModel[] {
        return segmentLigneDocuments.map((segmentLigneDocument) => this.toModel(segmentLigneDocument));
    }

    static toModel(segmentLigneDocument: SegmentDeLigneDocument): SegmentDeLigneModel {
        return {
            id: segmentLigneDocument._id.toString(),
            ligneDeBusId: segmentLigneDocument.lineId,
            pointDeRassemblementId: segmentLigneDocument.meetingPointId,
            heureArriveeBus: segmentLigneDocument.busArrivalHour,
            heureRencontre: segmentLigneDocument.meetingHour,
            heureDepart: segmentLigneDocument.departureHour,
            heureRetour: segmentLigneDocument.returnHour,
            typeTransport: segmentLigneDocument.transportType,
        };
    }

    static toEntity(
        segmentLigneModel: SegmentDeLigneModel,
    ): Omit<LigneToPointType, "createdAt" | "updatedAt" | "stepPoints"> {
        return {
            _id: segmentLigneModel.id,
            lineId: segmentLigneModel.ligneDeBusId,
            meetingPointId: segmentLigneModel.pointDeRassemblementId,
            busArrivalHour: segmentLigneModel.heureArriveeBus,
            meetingHour: segmentLigneModel.heureRencontre,
            departureHour: segmentLigneModel.heureDepart,
            returnHour: segmentLigneModel.heureRetour,
            transportType: segmentLigneModel.typeTransport,
            // TODO: add stepPoints
        };
    }
}
