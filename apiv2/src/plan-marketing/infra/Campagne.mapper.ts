import { CampagneType } from "snu-lib";
import { CampagneModel, CreateCampagneModel } from "../core/Campagne.model";

export class CampagneMapper {
    static toModel(document: CampagneType): CampagneModel {
        return {
            id: document._id.toString(),
            campagneGeneriqueId: document.campagneGeneriqueId,
            nom: document.nom,
            objet: document.objet,
            contexte: document.contexte,
            templateId: document.templateId,
            listeDiffusionId: document.listeDiffusionId,
            generic: document.generic,
            destinataires: document.destinataires,
            type: document.type,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }

    static toEntity(model: CampagneModel): Omit<CampagneType, "createdAt" | "updatedAt"> {
        return {
            _id: model.id,
            campagneGeneriqueId: model.campagneGeneriqueId,
            nom: model.nom,
            objet: model.objet,
            contexte: model.contexte,
            templateId: model.templateId,
            listeDiffusionId: model.listeDiffusionId,
            generic: model.generic,
            destinataires: model.destinataires,
            type: model.type,
        };
    }

    static toEntityCreate(model: CreateCampagneModel): Omit<CampagneType, "_id" | "createdAt" | "updatedAt"> {
        return {
            campagneGeneriqueId: model.campagneGeneriqueId,
            nom: model.nom,
            objet: model.objet,
            contexte: model.contexte,
            templateId: model.templateId,
            listeDiffusionId: model.listeDiffusionId,
            generic: model.generic,
            destinataires: model.destinataires,
            type: model.type,
        };
    }
}
