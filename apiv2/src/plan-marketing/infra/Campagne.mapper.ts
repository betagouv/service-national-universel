import {
    CampagneType,
    isCampagneWithRef,
    hasCampagneGeneriqueId,
    isCampagneGenerique,
    EnvoiCampagneStatut,
} from "snu-lib";
import {
    CampagneModel,
    CampagneSpecifiqueModel,
    CampagneGeneriqueModel,
    CreateCampagneModel,
} from "../core/Campagne.model";

export class CampagneMapper {
    /**
     * Convertit un document en modèle métier
     * @param document Document de la base de données
     * @returns Modèle métier typé selon le cas d'utilisation
     */
    static toModel(document: CampagneType): CampagneModel {
        // Cas 1 : Campagne spécifique avec référence - on ne garde que les champs minimaux
        if (!isCampagneGenerique(document) && hasCampagneGeneriqueId(document)) {
            return {
                id: document._id.toString(),
                generic: false,
                cohortId: document.cohortId!,
                campagneGeneriqueId: document.campagneGeneriqueId,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                envois: document.envois.map((envoi) => ({
                    date: envoi.date,
                    statut: EnvoiCampagneStatut[envoi.statut],
                })),
            };
        }

        // Champs communs pour les autres cas
        const baseModel = {
            id: document._id.toString(),
            nom: document.nom,
            objet: document.objet,
            contexte: document.contexte,
            templateId: document.templateId,
            listeDiffusionId: document.listeDiffusionId,
            destinataires: document.destinataires,
            type: document.type,
            envois: document.envois,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };

        // Cas 2 : Campagne générique - tous les champs + generic: true
        if (document.generic) {
            return {
                ...baseModel,
                generic: true,
            } as CampagneGeneriqueModel;
        }

        // Cas 3 : Campagne spécifique sans référence - tous les champs + cohortId
        return {
            ...baseModel,
            generic: false,
            cohortId: document.cohortId!,
        } as CampagneSpecifiqueModel;
    }

    /**
     * Convertit un modèle métier en entité pour la mise à jour en base
     * @param model Modèle métier
     * @returns Entité pour la base de données
     */
    static toEntity(model: CampagneModel): Omit<CampagneType, "createdAt" | "updatedAt"> {
        // Cas 1 : Campagne spécifique avec référence - uniquement les champs minimaux
        if (isCampagneWithRef(model)) {
            return {
                _id: model.id,
                generic: false,
                cohortId: model.cohortId,
                campagneGeneriqueId: model.campagneGeneriqueId,
            } as Omit<CampagneType, "createdAt" | "updatedAt">;
        }

        // Champs communs pour les autres cas
        const baseEntity = {
            _id: model.id,
            nom: model.nom,
            objet: model.objet,
            contexte: model.contexte,
            templateId: model.templateId,
            listeDiffusionId: model.listeDiffusionId,
            destinataires: model.destinataires,
            type: model.type,
            generic: model.generic,
            envois: model.envois || [],
        };

        // Cas 2 : Campagne générique - tous les champs sans cohortId ni référence
        if (model.generic) {
            return {
                ...baseEntity,
                cohortId: undefined,
                campagneGeneriqueId: undefined,
            };
        }

        // Cas 3 : Campagne spécifique sans référence - tous les champs + cohortId
        return {
            ...baseEntity,
            cohortId: model.cohortId,
            campagneGeneriqueId: undefined,
            originalCampagneGeneriqueId: model.originalCampagneGeneriqueId,
        };
    }

    /**
     * Convertit un modèle de création en entité pour l'insertion en base
     * @param model Modèle de création
     * @returns Entité pour la base de données
     */
    static toEntityCreate(
        model: CreateCampagneModel,
    ): Omit<CampagneType, "_id" | "createdAt" | "updatedAt" | "envois"> {
        // Cas 1 : Campagne spécifique avec référence - uniquement les champs minimaux
        if (isCampagneWithRef(model)) {
            return {
                generic: false,
                cohortId: model.cohortId,
                campagneGeneriqueId: model.campagneGeneriqueId,
            } as Omit<CampagneType, "_id" | "createdAt" | "updatedAt">;
        }

        // Champs communs pour les autres cas
        const baseEntity = {
            nom: model.nom,
            objet: model.objet,
            contexte: model.contexte,
            templateId: model.templateId,
            listeDiffusionId: model.listeDiffusionId,
            destinataires: model.destinataires,
            type: model.type,
            generic: model.generic,
        };

        // Cas 2 : Campagne générique - tous les champs sans cohortId ni référence
        if (model.generic) {
            return {
                ...baseEntity,
                cohortId: undefined,
                campagneGeneriqueId: undefined,
            };
        }

        // Cas 3 : Campagne spécifique sans référence - tous les champs + cohortId
        return {
            ...baseEntity,
            cohortId: model.cohortId,
            campagneGeneriqueId: undefined,
        };
    }
}
