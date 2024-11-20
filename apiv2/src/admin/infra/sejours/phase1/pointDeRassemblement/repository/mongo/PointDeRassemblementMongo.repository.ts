import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { PDR_MONGOOSE_ENTITY, PointDeRassemblementDocument } from "../../provider/PointDeRassemblementMongo.provider";
import { PointDeRassemblementModel } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.model";
import { PointDeRassemblementMapper } from "../PointDeRassemblement.mapper";

@Injectable()
export class PointDeRassemblementRepository implements PointDeRassemblementGateway {
    constructor(
        @Inject(PDR_MONGOOSE_ENTITY) private pointDeRassemblementMongooseEntity: Model<PointDeRassemblementDocument>,
        private readonly cls: ClsService,
    ) {}

    async create(pointDeRassemblement: PointDeRassemblementModel): Promise<PointDeRassemblementModel> {
        const pointDeRassemblementEntity = PointDeRassemblementMapper.toEntity(pointDeRassemblement);
        const createdPointDeRassemblement =
            await this.pointDeRassemblementMongooseEntity.create(pointDeRassemblementEntity);
        return PointDeRassemblementMapper.toModel(createdPointDeRassemblement);
    }

    async findById(id: string): Promise<PointDeRassemblementModel> {
        const pointDeRassemblement = await this.pointDeRassemblementMongooseEntity.findById(id);
        if (!pointDeRassemblement) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return PointDeRassemblementMapper.toModel(pointDeRassemblement);
    }
    async update(pointDeRassemblement: PointDeRassemblementModel): Promise<PointDeRassemblementModel> {
        const pointDeRassemblementEntity = PointDeRassemblementMapper.toEntity(pointDeRassemblement);
        const retrievedPointDeRassemblement = await this.pointDeRassemblementMongooseEntity.findById(
            pointDeRassemblement.id,
        );
        if (!retrievedPointDeRassemblement) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedPointDeRassemblement.set(pointDeRassemblementEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedPointDeRassemblement.save({ fromUser: user });
        return PointDeRassemblementMapper.toModel(retrievedPointDeRassemblement);
    }

    async findAll(): Promise<PointDeRassemblementModel[]> {
        const pointDeRassemblements = await this.pointDeRassemblementMongooseEntity.find();
        return PointDeRassemblementMapper.toModels(pointDeRassemblements);
    }

    async findBySessionId(sessionId: string): Promise<PointDeRassemblementModel[]> {
        // FIXME: les pdr ne sont plus rattaché à une session...
        const pointDeRassemblements = await this.pointDeRassemblementMongooseEntity.find({ cohortIds: sessionId });
        return PointDeRassemblementMapper.toModels(pointDeRassemblements);
    }
}
