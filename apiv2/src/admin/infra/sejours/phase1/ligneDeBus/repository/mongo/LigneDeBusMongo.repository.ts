import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ClientSession, Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { LIGNEDEBUS_MONGOOSE_ENTITY, LigneDeBusDocument } from "../../provider/LigneDeBusMongo.provider";
import { LigneDeBusModel } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";
import { LigneDeBusMapper } from "../LigneDeBus.mapper";
import { DbSessionGateway } from "@shared/core/DbSession.gateway";

@Injectable()
export class LigneDeBusRepository implements LigneDeBusGateway {
    constructor(
        @Inject(LIGNEDEBUS_MONGOOSE_ENTITY) private ligneDeBusMongooseEntity: Model<LigneDeBusDocument>,
        @Inject(DbSessionGateway) private readonly dbSessionGateway: DbSessionGateway<ClientSession>,
        private readonly cls: ClsService,
    ) {}

    async create(ligneDeBus: LigneDeBusModel): Promise<LigneDeBusModel> {
        const ligneDeBusEntity = LigneDeBusMapper.toEntity(ligneDeBus);
        const createdLigneDeBus = await this.ligneDeBusMongooseEntity.create(ligneDeBusEntity);
        return LigneDeBusMapper.toModel(createdLigneDeBus);
    }

    async findById(id: string): Promise<LigneDeBusModel> {
        const ligneDeBus = await this.ligneDeBusMongooseEntity.findById(id);
        if (!ligneDeBus) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return LigneDeBusMapper.toModel(ligneDeBus);
    }
    async update(ligneDeBus: LigneDeBusModel, updateOriginName: string): Promise<LigneDeBusModel> {
        const ligneDeBusEntity = LigneDeBusMapper.toEntity(ligneDeBus);
        const retrievedLigneDeBus = await this.ligneDeBusMongooseEntity.findById(ligneDeBus.id);
        if (!retrievedLigneDeBus) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedLigneDeBus.set(ligneDeBusEntity);
        const user = updateOriginName ? { firstName: updateOriginName } : this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedLigneDeBus.save({ fromUser: user, session: this.dbSessionGateway.get() });
        return LigneDeBusMapper.toModel(retrievedLigneDeBus);
    }

    async findAll(): Promise<LigneDeBusModel[]> {
        const lignesDeBus = await this.ligneDeBusMongooseEntity.find();
        return LigneDeBusMapper.toModels(lignesDeBus);
    }

    async findBySessionId(sessionId: string): Promise<LigneDeBusModel[]> {
        const lignesDeBus = await this.ligneDeBusMongooseEntity.find({ cohortId: sessionId });
        return LigneDeBusMapper.toModels(lignesDeBus);
    }

    async findBySessionNom(sessionNom: string): Promise<LigneDeBusModel[]> {
        const lignesDeBus = await this.ligneDeBusMongooseEntity.find({ cohort: sessionNom });
        return LigneDeBusMapper.toModels(lignesDeBus);
    }
}
