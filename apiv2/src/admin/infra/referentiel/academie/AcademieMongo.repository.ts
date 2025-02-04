import { Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { AcademieGateway } from "@admin/core/referentiel/academie/Academie.gateway";
import { ACADEMIE_MONGOOSE_ENTITY, AcademieDocument } from "./Academie.provider";
import { AcademieModel } from "@admin/core/referentiel/academie/Academie.model";
import { AcademieMapper } from "./Academie.mapper";

export class AcademieMongoRepository implements AcademieGateway {
    constructor(
        @Inject(ACADEMIE_MONGOOSE_ENTITY) private readonly academieMongooseEntity: Model<AcademieDocument>,
    ) { }
    
    async deleteAll(): Promise<void> {
        await this.academieMongooseEntity.deleteMany({});
    }

    async findByCode(code: string): Promise<AcademieModel | undefined> {
        const academie = await this.academieMongooseEntity.findOne({ code });
        if (!academie) {
            return;
        }
        return AcademieMapper.toModel(academie);
    }

    async create(academie: AcademieModel): Promise<AcademieModel> {
        const document = AcademieMapper.toDocument(academie);
        const academieDocument = await this.academieMongooseEntity.create(document);
        return AcademieMapper.toModel(academieDocument);
    }

    async update(academie: AcademieModel): Promise<AcademieModel> {
        const document = AcademieMapper.toDocument(academie);
        const academieDocument = await this.academieMongooseEntity.findByIdAndUpdate(
            document._id,
            document,
            { new: true, }
        ).exec();

        if (!academieDocument) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                `L'académie avec le libelle ${academie.libelle} n'existe pas`
            );
        }

        return AcademieMapper.toModel(academieDocument);
    }
}
