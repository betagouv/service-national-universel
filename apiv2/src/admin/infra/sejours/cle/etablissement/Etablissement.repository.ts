import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { EtablissementGateway } from "src/admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { EtablissementModel } from "src/admin/core/sejours/cle/etablissement/Etablissement.model";
import { EtablissementMapper } from "./Etablissement.mapper";
import { ETABLISSEMENT_MONGOOSE_ENTITY, EtablissementDocument } from "./provider/EtablissementMongo.provider";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

@Injectable()
export class EtablissementRepository implements EtablissementGateway {
    constructor(
        @Inject(ETABLISSEMENT_MONGOOSE_ENTITY) private etablissementMongooseEntity: Model<EtablissementDocument>,
    ) {}

    create(etablissementModel: EtablissementModel): Promise<EtablissementModel> {
        const etablissementEntity = EtablissementMapper.toEntity(etablissementModel);
        return this.etablissementMongooseEntity
            .create(etablissementEntity)
            .then((etablissement: EtablissementDocument) => EtablissementMapper.toModel(etablissement));
    }
    async findById(id: string): Promise<EtablissementModel> {
        const etablissement = await this.etablissementMongooseEntity.findById(id);
        if (!etablissement) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return EtablissementMapper.toModel(etablissement);
    }
}
