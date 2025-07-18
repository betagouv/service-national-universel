import { CandidatureModel } from "@admin/core/engagement/candidature/Candidature.model";
import { CandidatureDocument } from "../provider/CandidatureMongo.provider";
import { ApplicationType } from "snu-lib";

export class CandidatureMapper {
    static toModels(candidatureDocuments: CandidatureDocument[]): CandidatureModel[] {
        return candidatureDocuments.map((candidatureDocument) => this.toModel(candidatureDocument));
    }

    static toModel(candidatureDocument: CandidatureDocument): CandidatureModel {
        return {
            id: candidatureDocument._id.toString(),
            isJvaMission: candidatureDocument.isJvaMission === "true",
            contractAvenantFiles: candidatureDocument.contractAvenantFiles,
            justificatifsFiles: candidatureDocument.justificatifsFiles,
            feedBackExperienceFiles: candidatureDocument.feedBackExperienceFiles,
            status: candidatureDocument.status,
            othersFiles: candidatureDocument.othersFiles,
            contractStatus: candidatureDocument.contractStatus,
            filesType: candidatureDocument.filesType,
            jeuneId: candidatureDocument.youngId,
        };
    }

    static toEntity(candidatureModel: CandidatureModel): Omit<ApplicationType, "createdAt" | "updatedAt"> {
        return {
            _id: candidatureModel.id,
            isJvaMission: candidatureModel.isJvaMission ? "true" : "false",
            contractAvenantFiles: candidatureModel.contractAvenantFiles,
            justificatifsFiles: candidatureModel.justificatifsFiles,
            feedBackExperienceFiles: candidatureModel.feedBackExperienceFiles,
            status: candidatureModel.status,
            othersFiles: candidatureModel.othersFiles,
            contractStatus: candidatureModel.contractStatus,
            filesType: candidatureModel.filesType,
            youngId: candidatureModel.jeuneId,
        };
    }
}
