import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { CampagneGateway } from "../core/gateway/Campagne.gateway";
import {
    CampagneModel,
    CampagneSpecifiqueModelWithRefAndGeneric,
    CampagneSpecifiqueModelWithoutRef,
    CreateCampagneModel,
} from "../core/Campagne.model";
import { CampagneEnvoi } from "@plan-marketing/core/Campagne.model";
import { CAMPAGNE_MONGOOSE_ENTITY, CampagneDocument } from "./CampagneMongo.provider";
import { CampagneMapper } from "./Campagne.mapper";
import { buildFilter } from "./PlanMarketingFilterBuilder.util";
import { isCampagneSansRef, isCampagneWithRef, isCampagneGenerique } from "snu-lib";

@Injectable()
export class CampagneMongoRepository implements CampagneGateway {
    constructor(
        @Inject(CAMPAGNE_MONGOOSE_ENTITY)
        private campagneEntity: Model<CampagneDocument>,
    ) {}

    async addEnvoiToCampagneById(campagneId: string, envoi: CampagneEnvoi): Promise<CampagneModel | null> {
        const updated = await this.campagneEntity.findByIdAndUpdate(
            campagneId,
            { $push: { envois: { ...envoi, _id: undefined } } },
            { new: true },
        );
        return updated ? CampagneMapper.toModel(updated) : null;
    }
    async findSpecifiqueWithRefById(id: string): Promise<CampagneSpecifiqueModelWithRefAndGeneric | null> {
        const campagneEntity = await this.campagneEntity.findById(id);
        if (!campagneEntity) {
            return null;
        }
        const campagne = CampagneMapper.toModel(campagneEntity);
        if (isCampagneWithRef(campagne)) {
            const campagneGenerique = await this.campagneEntity.findById(campagne.campagneGeneriqueId);
            if (campagneGenerique) {
                return {
                    ...campagne,
                    nom: campagneGenerique.nom!,
                    objet: campagneGenerique.objet!,
                    contexte: campagneGenerique.contexte,
                    templateId: campagneGenerique.templateId!,
                    listeDiffusionId: campagneGenerique.listeDiffusionId!,
                    destinataires: campagneGenerique.destinataires,
                    type: campagneGenerique.type!,
                    envois: [],
                    programmations: campagneGenerique.programmations?.map(CampagneMapper.toModelProgrammation),
                    isProgrammationActive: campagneGenerique.isProgrammationActive || false,
                    isArchived: campagneGenerique.isArchived || false,
                };
            }
        }
        return null;
    }
    findSpecifiqueWithoutRefById(id: string): Promise<CampagneSpecifiqueModelWithoutRef | null> {
        throw new Error("Method not implemented.");
    }
    async updateAndRemoveRef(campagne: CampagneModel): Promise<CampagneModel | null> {
        const entityToUpdate = CampagneMapper.toEntity(campagne);
        const updated = await this.campagneEntity.findByIdAndUpdate(
            campagne.id,
            { $set: entityToUpdate, $unset: { campagneGeneriqueId: 1 } },
            { new: true },
        );
        return updated ? CampagneMapper.toModel(updated) : null;
    }
    async search(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<CampagneModel[]> {
        const { isArchived, isProgrammationActive, ...restFilter } = filter || {};
        const mongoFilter = this.buildMongoFilter(restFilter);
        const campagnes = await this.campagneEntity.find(mongoFilter).sort({ createdAt: sort === "ASC" ? 1 : -1 });
        const campagnesModels = await Promise.all(
            campagnes.map(async (campagne) => {
                const campagneModel = CampagneMapper.toModel(campagne);
                if (isCampagneWithRef(campagneModel)) {
                    const campagneGenerique = await this.campagneEntity.findById(campagneModel.campagneGeneriqueId);
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
                            programmations: campagneGenerique.programmations?.map(CampagneMapper.toModelProgrammation),
                            isProgrammationActive: campagneGenerique.isProgrammationActive || false,
                            isArchived: campagneGenerique.isArchived || false,
                        };
                    }
                }
                return campagneModel;
            })
        );

        return campagnesModels.filter((campagne) => {
            if (typeof isArchived === "boolean") {
                if (isCampagneGenerique(campagne) || isCampagneWithRef(campagne) || isCampagneSansRef(campagne)) {
                    if ((campagne as any).isArchived !== isArchived) {
                        return false;
                    }
                }
            }
            if (typeof isProgrammationActive === "boolean") {
                if (isCampagneGenerique(campagne) || isCampagneWithRef(campagne) || isCampagneSansRef(campagne)) {
                    if ((campagne as any).isProgrammationActive !== isProgrammationActive) {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    async save(campagne: CreateCampagneModel): Promise<CampagneModel> {
        const created = await this.campagneEntity.create(CampagneMapper.toEntityCreate(campagne));
        return CampagneMapper.toModel(created);
    }

    async findById(id: string): Promise<CampagneModel | null> {
        const campagneEntity = await this.campagneEntity.findById(id);
        if (!campagneEntity) {
            return null;
        }
        const campagneModel = CampagneMapper.toModel(campagneEntity);
        if (isCampagneSansRef(campagneModel)) {
            return campagneModel;
        }
        if (isCampagneWithRef(campagneModel)) {
            const campagneGenerique = await this.campagneEntity.findById(campagneModel.campagneGeneriqueId).lean();
            if (campagneGenerique) {
                return {
                    ...campagneModel,
                    //@ts-expect-error nom
                    nom: campagneGenerique.nom,
                    objet: campagneGenerique.objet,
                    contexte: campagneGenerique.contexte,
                    templateId: campagneGenerique.templateId,
                    listeDiffusionId: campagneGenerique.listeDiffusionId,
                    destinataires: campagneGenerique.destinataires,
                    type: campagneGenerique.type,
                    programmations: campagneGenerique.programmations?.map(CampagneMapper.toModelProgrammation),
                    isProgrammationActive: campagneGenerique.isProgrammationActive || false,
                    isArchived: campagneGenerique.isArchived || false,
                };
            }
            return campagneModel;
        }
        return campagneModel;
    }

    async update(campagne: CampagneModel): Promise<CampagneModel | null> {
        // Le mapper est nécessaire pour garantir la cohérence des différents types de campagnes:
        // - Pour une campagne générique : tous les champs sont conservés
        // - Pour une campagne spécifique sans référence : tous les champs + cohortId sont conservés
        // - Pour une campagne spécifique avec référence : seuls generic, cohortId et campagneGeneriqueId sont conservés, les autres sont effacés
        const entityToUpdate = CampagneMapper.toEntity(campagne);
        const updated = await this.campagneEntity.findByIdAndUpdate(campagne.id, entityToUpdate, { new: true });
        return updated ? CampagneMapper.toModel(updated) : null;
    }

    async delete(id: string): Promise<void> {
        await this.campagneEntity.findByIdAndDelete(id);
    }

    async updateProgrammationSentDate(
        campagneId: string,
        programmationId: string,
        sentDate: Date,
    ): Promise<CampagneModel | null> {
        const campagne = await this.campagneEntity.findById(campagneId);
        if (!campagne || !campagne.programmations || campagne.programmations.length === 0) {
            return null;
        }
        const programmation = campagne.programmations.find(
            (programmation) => programmation._id.toString() === programmationId,
        );
        if (!programmation) {
            return null;
        }
        programmation.sentAt = sentDate;
        const updated = await campagne.save();
        return updated ? CampagneMapper.toModel(updated) : null;
    }

    async findCampagnesWithProgrammationBetweenDates(startDate: Date, endDate: Date): Promise<CampagneModel[]> {
        const campagnesSpecifiquesWithoutRef = await this.campagneEntity
            .find({
                $and: [
                    {
                        "programmations.envoiDate": {
                            $gte: startDate,
                            $lte: endDate,
                        },
                    },
                    { generic: false },
                ],
            })
            .lean();
        const campagnesWithProgrammation = campagnesSpecifiquesWithoutRef.map(CampagneMapper.toModel);

        const campagnesSpecifiquesWithRef = await this.campagneEntity
            .find({
                generic: false,
                campagneGeneriqueId: { $ne: null },
            })
            .lean();

        for (const campagneSpecifiqueWithRef of campagnesSpecifiquesWithRef) {
            const campagneGenerique = await this.campagneEntity.findById(campagneSpecifiqueWithRef.campagneGeneriqueId);
            const hasSomeProgrammationBetweenDates = campagneGenerique?.programmations?.some(
                (programmation) =>
                    programmation.envoiDate &&
                    programmation.envoiDate >= startDate &&
                    programmation.envoiDate <= endDate,
            );
            if (campagneGenerique && hasSomeProgrammationBetweenDates) {
                const campagneModel: CampagneModel = CampagneMapper.toModel({
                    _id: campagneSpecifiqueWithRef._id,
                    createdAt: campagneSpecifiqueWithRef.createdAt,
                    updatedAt: campagneSpecifiqueWithRef.updatedAt,
                    generic: campagneSpecifiqueWithRef.generic,
                    envois: campagneSpecifiqueWithRef.envois,
                    nom: campagneGenerique.nom,
                    objet: campagneGenerique.objet,
                    contexte: campagneGenerique.contexte,
                    templateId: campagneGenerique.templateId,
                    listeDiffusionId: campagneGenerique.listeDiffusionId,
                    destinataires: campagneGenerique.destinataires,
                    isProgrammationActive: campagneGenerique.isProgrammationActive,
                    isArchived: campagneGenerique.isArchived,
                    programmations: campagneGenerique.programmations,
                });
                campagnesWithProgrammation.push(campagneModel);
            }
        }

        return campagnesWithProgrammation;
    }

    async findCampagneSpecifiquesByCampagneGeneriqueId(
        campagneGeneriqueId: string,
    ): Promise<CampagneSpecifiqueModelWithRefAndGeneric[]> {
        const campagnesSpecifiques = await this.campagneEntity.find({
            campagneGeneriqueId: campagneGeneriqueId,
            generic: false,
        });

        const results = await Promise.all(
            campagnesSpecifiques.map(async (campagne) => {
                const campagneModel = CampagneMapper.toModel(campagne);
                if (isCampagneWithRef(campagneModel)) {
                    const campagneGenerique = await this.campagneEntity.findById(campagneModel.campagneGeneriqueId);
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
                            programmations: campagneGenerique.programmations?.map(CampagneMapper.toModelProgrammation),
                            isProgrammationActive: campagneGenerique.isProgrammationActive || false,
                            isArchived: campagneGenerique.isArchived || false,
                        } as CampagneSpecifiqueModelWithRefAndGeneric;
                    }
                }
            }),
        );

        return results.filter((item): item is CampagneSpecifiqueModelWithRefAndGeneric => item !== null);
    }

    private buildMongoFilter(filter?: Record<string, any>): Record<string, unknown> {
        const cleanedFilter = buildFilter(filter, ["isArchived", "isProgrammationActive", "isLinkedToGenericCampaign"]);
        let mongoFilter = { ...cleanedFilter };
        if ("isLinkedToGenericCampaign" in mongoFilter) {
            mongoFilter = {
                ...mongoFilter,
                campagneGeneriqueId: mongoFilter.isLinkedToGenericCampaign
                    ? { $ne: null }
                    : { $eq: null },
            };
            const { isLinkedToGenericCampaign, ...rest } = mongoFilter;
            mongoFilter = rest;
        }
        return mongoFilter;
    }
}
