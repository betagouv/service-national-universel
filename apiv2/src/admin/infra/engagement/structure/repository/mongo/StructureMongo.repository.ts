import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { STRUCTURE_MONGOOSE_ENTITY, StructureDocument } from "../../provider/StructureMongo.provider";
import { StructureMapper } from "../Structure.mapper";

import { StructureModel } from "@admin/core/engagement/structure/Structure.model";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";

@Injectable()
export class StructureRepository implements StructureGateway {
    constructor(@Inject(STRUCTURE_MONGOOSE_ENTITY) private structureMongooseEntity: Model<StructureDocument>) {}

    async findByIds(ids: string[]): Promise<StructureModel[]> {
        const structures = await this.structureMongooseEntity.find({ _id: { $in: ids } });
        return StructureMapper.toModels(structures);
    }

    async findById(id: string): Promise<StructureModel> {
        const structure = await this.structureMongooseEntity.findById(id);
        if (!structure) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return StructureMapper.toModel(structure);
    }

    async findByIdOrNetworkId(id: string): Promise<StructureModel[]> {
        const structures = await this.structureMongooseEntity.find({ $or: [{ _id: id }, { networkId: id }] });
        return StructureMapper.toModels(structures);
    }
}
