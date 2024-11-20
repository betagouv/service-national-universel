import { CohortType } from "snu-lib";

import { SessionDocument } from "../provider/SessionMongo.provider";
import { SessionModel } from "@admin/core/sejours/phase1/session/Session.model";

export class SessionMapper {
    static toModels(sejourDocuments: SessionDocument[]): SessionModel[] {
        return sejourDocuments.map((sejourDocument) => this.toModel(sejourDocument));
    }

    static toModel(sejourDocument: SessionDocument): SessionModel {
        return {
            id: sejourDocument._id.toString(),
            nom: sejourDocument.name,
        };
    }

    static toEntity(sejourModel: SessionModel): Omit<CohortType, "createdAt" | "updatedAt"> {
        return {
            _id: sejourModel.id,
            name: sejourModel.nom,
        } as CohortType; // FIXME: ajouter les champs obligatoire;
    }
}
