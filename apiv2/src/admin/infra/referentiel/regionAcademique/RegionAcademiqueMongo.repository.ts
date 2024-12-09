import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { REGION_ACADEMIQUE_MONGOOSE_ENTITY, RegionAcademiqueDocument } from "./RegionAcademiqueMongo.provider";
import { CreateRegionAcademiqueModel, RegionAcademiqueModel } from "@admin/core/referentiel/regionAcademique/RegionAcademique.model";
import { RegionAcademiqueMapper } from "./RegionAcademique.mapper";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";

@Injectable()
export class RegionAcademiqueRepository implements RegionAcademiqueGateway {
    constructor(
        @Inject(REGION_ACADEMIQUE_MONGOOSE_ENTITY) private regionAcademiqueMongooseEntity: Model<RegionAcademiqueDocument>,
    ) {}

    async findByCode(code: string): Promise<RegionAcademiqueModel> {
        try {
            const regionAcademique = await this.regionAcademiqueMongooseEntity.findOne({ code }).exec();
        
            if (!regionAcademique) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    `La région académique avec le code ${code} n'existe pas`,
                );
            }

            return RegionAcademiqueMapper.toModel(regionAcademique);
        } catch (error) {
            if (error instanceof FunctionalException) {
                throw error;
            }
            throw new TechnicalException(
                TechnicalExceptionType.DATABASE_ERROR,
                `Erreur lors de la recherche de la région académique ${code}`,
            );
        }
    }

    async insert(regionAcademique: CreateRegionAcademiqueModel): Promise<RegionAcademiqueModel> {
        try {
            const regionAcademiqueDocument = await this.regionAcademiqueMongooseEntity.create(regionAcademique);
            return RegionAcademiqueMapper.toModel(regionAcademiqueDocument);
        } catch (error) {
            console.error("Erreur d'insertion:", error);
            throw new TechnicalException(
                TechnicalExceptionType.DATABASE_ERROR,
                `Erreur lors de l'insertion de la région académique ${regionAcademique.libelle}`,
            );
        }
    }
    
    async update(regionAcademique: RegionAcademiqueModel): Promise<RegionAcademiqueModel> {
        try {
            const regionAcademiqueDocument = await this.regionAcademiqueMongooseEntity.findByIdAndUpdate(
                regionAcademique.id,
                regionAcademique,
                { new: true }
            ).exec();

            if (!regionAcademiqueDocument) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    `La région académique avec le libelle ${regionAcademique.libelle} n'existe pas`
                );
            }

            return RegionAcademiqueMapper.toModel(regionAcademiqueDocument);
        } catch (error) {
            console.error("Erreur de mise à jour:", error);
            throw new TechnicalException(
                TechnicalExceptionType.DATABASE_ERROR,
                `Erreur lors de la mise à jour de la région académique ${regionAcademique.libelle} - ${error}`
            );
        }
    }
}
