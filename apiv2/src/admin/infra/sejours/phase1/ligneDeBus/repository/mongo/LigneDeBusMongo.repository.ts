import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { LigneDeBusGateway } from "src/admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { LIGNEDEBUS_MONGOOSE_ENTITY, LigneDeBusDocument } from "../../provider/LigneDeBusMongo.provider";
import { LigneDeBusModel } from "src/admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";
import { LigneDeBusMapper } from "../LigneDeBus.mapper";

@Injectable()
export class LigneDeBusRepository implements LigneDeBusGateway {
    constructor(
        @Inject(LIGNEDEBUS_MONGOOSE_ENTITY) private pointDeRassemblementMongooseEntity: Model<LigneDeBusDocument>,
        private readonly cls: ClsService,
    ) {}

    async create(pointDeRassemblement: LigneDeBusModel): Promise<LigneDeBusModel> {
        const pointDeRassemblementEntity = LigneDeBusMapper.toEntity(pointDeRassemblement);
        const createdLigneDeBus = await this.pointDeRassemblementMongooseEntity.create(pointDeRassemblementEntity);
        return LigneDeBusMapper.toModel(createdLigneDeBus);
    }

    async findById(id: string): Promise<LigneDeBusModel> {
        const pointDeRassemblement = await this.pointDeRassemblementMongooseEntity.findById(id);
        if (!pointDeRassemblement) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return LigneDeBusMapper.toModel(pointDeRassemblement);
    }
    async update(pointDeRassemblement: LigneDeBusModel): Promise<LigneDeBusModel> {
        const pointDeRassemblementEntity = LigneDeBusMapper.toEntity(pointDeRassemblement);
        const retrievedLigneDeBus = await this.pointDeRassemblementMongooseEntity.findById(pointDeRassemblement.id);
        if (!retrievedLigneDeBus) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedLigneDeBus.set(pointDeRassemblementEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedLigneDeBus.save({ fromUser: user });
        return LigneDeBusMapper.toModel(retrievedLigneDeBus);
    }

    async findAll(): Promise<LigneDeBusModel[]> {
        const pointDeRassemblements = await this.pointDeRassemblementMongooseEntity.find();
        return LigneDeBusMapper.toModels(pointDeRassemblements);
    }

    async findBySessionId(sessionId: string): Promise<LigneDeBusModel[]> {
        const pointDeRassemblements = await this.pointDeRassemblementMongooseEntity.find({ cohortId: sessionId });
        return LigneDeBusMapper.toModels(pointDeRassemblements);
    }
}
