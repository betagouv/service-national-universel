import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { CampagneGateway } from "../core/gateway/Campagne.gateway";
import { CampagneModel, CreateCampagneModel } from "../core/Campagne.model";
import { CAMPAGNE_MONGOOSE_ENTITY, CampagneDocument } from "./CampagneMongo.provider";
import { CampagneMapper } from "./Campagne.mapper";
import { isCampagneWithRef } from "snu-lib";

@Injectable()
export class CampagneMongoRepository implements CampagneGateway {
    constructor(
        @Inject(CAMPAGNE_MONGOOSE_ENTITY)
        private campagneModel: Model<CampagneDocument>,
    ) {}
    async updateAndRemoveRef(campagne: CampagneModel): Promise<CampagneModel | null> {
        const entityToUpdate = CampagneMapper.toEntity(campagne);
        const updated = await this.campagneModel.findByIdAndUpdate(
            campagne.id,
            { $set: entityToUpdate, $unset: { campagneGeneriqueId: 1 } },
            { new: true },
        );
        return updated ? CampagneMapper.toModel(updated) : null;
    }
    async search(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<CampagneModel[]> {
        const campagnes = await this.campagneModel.find({ ...filter }).sort({ createdAt: sort === "ASC" ? 1 : -1 });
        return Promise.all(
            campagnes.map(async (campagne) => {
                const campagneModel = CampagneMapper.toModel(campagne);
                if (isCampagneWithRef(campagneModel)) {
                    const campagneGenerique = await this.campagneModel.findById(campagneModel.campagneGeneriqueId);
                    if (campagneGenerique) {
                        return {
                            ...campagneModel,
                            nom: campagneGenerique.nom,
                            objet: campagneGenerique.objet,
                            contexte: campagneGenerique.contexte,
                            templateId: campagneGenerique.templateId,
                            listeDiffusionId: campagneGenerique.listeDiffusionId,
                            destinataires: campagneGenerique.destinataires,
                            type: campagneGenerique.type,
                        };
                    }
                }
                return campagneModel;
            }),
        );
    }

    async save(campagne: CreateCampagneModel): Promise<CampagneModel> {
        const created = await this.campagneModel.create(CampagneMapper.toEntityCreate(campagne));
        return CampagneMapper.toModel(created);
    }

    async findById(id: string): Promise<CampagneModel | null> {
        const campagneEntity = await this.campagneModel.findById(id);
        return campagneEntity ? CampagneMapper.toModel(campagneEntity) : null;
    }

    async update(campagne: CampagneModel): Promise<CampagneModel | null> {
        // Le mapper est nécessaire pour garantir la cohérence des différents types de campagnes:
        // - Pour une campagne générique : tous les champs sont conservés
        // - Pour une campagne spécifique sans référence : tous les champs + cohortId sont conservés
        // - Pour une campagne spécifique avec référence : seuls generic, cohortId et campagneGeneriqueId sont conservés, les autres sont effacés
        const entityToUpdate = CampagneMapper.toEntity(campagne);
        const updated = await this.campagneModel.findByIdAndUpdate(campagne.id, entityToUpdate, { new: true });
        return updated ? CampagneMapper.toModel(updated) : null;
    }

    async delete(id: string): Promise<void> {
        await this.campagneModel.findByIdAndDelete(id);
    }
}
