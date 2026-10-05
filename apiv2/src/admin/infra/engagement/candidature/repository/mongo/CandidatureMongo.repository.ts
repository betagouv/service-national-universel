import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { APPLICATION_STATUS } from "snu-lib";
import { CANDIDATURE_MONGOOSE_ENTITY, CandidatureDocument } from "../../provider/CandidatureMongo.provider";
import { CandidatureMapper } from "../Candidature.mapper";
import { CandidatureGateway } from "@admin/core/engagement/candidature/Candidature.gateway";
import { CandidatureModel } from "@admin/core/engagement/candidature/Candidature.model";

/**
 * Une proposition de mission en attente d'acceptation n'est pas une candidature pour la structure : elle ne lui
 * ouvre pas le volontaire. Même règle que le périmètre de l'api v1.
 */
const NOT_A_PROPOSAL = { status: { $ne: APPLICATION_STATUS.WAITING_ACCEPTATION } };

@Injectable()
export class CandidatureRepository implements CandidatureGateway {
    constructor(@Inject(CANDIDATURE_MONGOOSE_ENTITY) private candidatureMongooseEntity: Model<CandidatureDocument>) {}

    async findByIds(ids: string[]): Promise<CandidatureModel[]> {
        const candidatures = await this.candidatureMongooseEntity.find({ _id: { $in: ids } });
        return CandidatureMapper.toModels(candidatures);
    }

    async findById(id: string): Promise<CandidatureModel> {
        const candidature = await this.candidatureMongooseEntity.findById(id);
        if (!candidature) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return CandidatureMapper.toModel(candidature);
    }

    async findByStructureId(id: string): Promise<CandidatureModel[]> {
        const candidatures = await this.candidatureMongooseEntity.find({ structureId: id, ...NOT_A_PROPOSAL });
        return CandidatureMapper.toModels(candidatures);
    }

    async findByStructureIds(ids: string[]): Promise<CandidatureModel[]> {
        const candidatures = await this.candidatureMongooseEntity.find({
            structureId: { $in: ids },
            ...NOT_A_PROPOSAL,
        });
        return CandidatureMapper.toModels(candidatures);
    }
}
