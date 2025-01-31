import { Inject } from "@nestjs/common";
import { Model } from "mongoose";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { DepartementGateway } from "@admin/core/referentiel/departement/Departement.gateway";
import { DEPARTEMENT_MONGOOSE_ENTITY, DepartementDocument } from "./DepartementMongo.provider";
import { DepartementModel } from "@admin/core/referentiel/departement/Departement.model";
import { DepartementMapper } from "./Departement.mapper";

export class DepartementMongoRepository implements DepartementGateway {
    constructor(
        @Inject(DEPARTEMENT_MONGOOSE_ENTITY) private readonly departementMongooseEntity: Model<DepartementDocument>,
    ) { }
    async findByCode(code: string): Promise<DepartementModel | undefined> {
        const departement = await this.departementMongooseEntity.findOne({ code });
        if (!departement) {
            return;
        }
        return DepartementMapper.toModel(departement);
    }

    async create(departement: DepartementModel): Promise<DepartementModel> {
        const document = DepartementMapper.toDocument(departement);
        const departementDocument = await this.departementMongooseEntity.create(document);
        return DepartementMapper.toModel(departementDocument);
    }

    async update(departement: DepartementModel): Promise<DepartementModel> {
        const document = DepartementMapper.toDocument(departement);
        const departementDocument = await this.departementMongooseEntity.findByIdAndUpdate(
            document._id,
            document,
            { new: true, }
        ).exec();

        if (!departementDocument) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                `Le département avec le libelle ${departement.libelle} n'existe pas`
            );
        }

        return DepartementMapper.toModel(departementDocument);
    }
}
