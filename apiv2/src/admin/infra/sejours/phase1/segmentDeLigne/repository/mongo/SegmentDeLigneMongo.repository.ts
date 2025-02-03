import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { SegmentDeLigneGateway } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.gateway";
import { SEGMENTLIGNE_MONGOOSE_ENTITY, SegmentDeLigneDocument } from "../../provider/SegmentDeLigneMongo.provider";
import { SegmentDeLigneModel } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.model";
import { SegmentDeLigneMapper } from "../SegmentDeLigne.mapper";

@Injectable()
export class SegmentDeLigneRepository implements SegmentDeLigneGateway {
    constructor(
        @Inject(SEGMENTLIGNE_MONGOOSE_ENTITY) private segmentDeLigneMongooseEntity: Model<SegmentDeLigneDocument>,
        private readonly cls: ClsService,
    ) {}

    async findByLigneDeBusIds(ids: string[]): Promise<SegmentDeLigneModel[]> {
        const segmentDeLignes = await this.segmentDeLigneMongooseEntity.find({ lineId: { $in: ids } });
        return SegmentDeLigneMapper.toModels(segmentDeLignes);
    }

    async delete(segmentDeLigne: SegmentDeLigneModel): Promise<void> {
        const retrievedSegmentDeLigne = await this.segmentDeLigneMongooseEntity.findById(segmentDeLigne.id);
        if (!retrievedSegmentDeLigne) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        await retrievedSegmentDeLigne.deleteOne();
    }
}
