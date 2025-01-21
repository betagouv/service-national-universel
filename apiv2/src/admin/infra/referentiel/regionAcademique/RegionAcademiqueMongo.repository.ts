import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { REGION_ACADEMIQUE_MONGOOSE_ENTITY, RegionAcademiqueDocument } from "./RegionAcademiqueMongo.provider";
import { RegionAcademiqueModel } from "@admin/core/referentiel/regionAcademique/RegionAcademique.model";
import { Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { RegionAcademiqueMapper } from "./RegionAcademique.mapper";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

export class RegionAcademiqueMongoRepository implements RegionAcademiqueGateway {
    constructor(
        @Inject(REGION_ACADEMIQUE_MONGOOSE_ENTITY) private readonly regionAcademiqueMongooseEntity: Model<RegionAcademiqueDocument>,
    ) {}
    async findByCode(code: string): Promise<RegionAcademiqueModel | undefined> {
        const regionAcademique = await this.regionAcademiqueMongooseEntity.findOne({ code });
        if (!regionAcademique) {
            return;
        }
        return RegionAcademiqueMapper.toModel(regionAcademique);
    }

    async create(regionAcademique: RegionAcademiqueModel): Promise<RegionAcademiqueModel> {
            const document = RegionAcademiqueMapper.toDocument(regionAcademique);
            const regionAcademiqueDocument = await this.regionAcademiqueMongooseEntity.create(document);
            return RegionAcademiqueMapper.toModel(regionAcademiqueDocument);
    }

    async update(regionAcademique: RegionAcademiqueModel): Promise<RegionAcademiqueModel> {
        const document = RegionAcademiqueMapper.toDocument(regionAcademique);
            const regionAcademiqueDocument = await this.regionAcademiqueMongooseEntity.findByIdAndUpdate(
                document._id,
                document,
                { new: true, }
            ).exec();

            if (!regionAcademiqueDocument) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    `La région académique avec le libelle ${regionAcademique.libelle} n'existe pas`
                );
            }

        return RegionAcademiqueMapper.toModel(regionAcademiqueDocument);
    }
}
