import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ClientSession, Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { SEJOUR_MONGOOSE_ENTITY, SejourDocument } from "../../provider/SejourMongo.provider";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";
import { SejourModel } from "@admin/core/sejours/phase1/sejour/Sejour.model";
import { SejourMapper } from "../Sejour.mapper";
import { DbSessionGateway } from "@shared/core/DbSession.gateway";

@Injectable()
export class SejourRepository implements SejourGateway {
    constructor(
        @Inject(SEJOUR_MONGOOSE_ENTITY) private sejourMongooseEntity: Model<SejourDocument>,
        @Inject(DbSessionGateway) private readonly dbSessionGateway: DbSessionGateway<ClientSession>,
        private readonly cls: ClsService,
    ) {}

    async create(sejour: SejourModel): Promise<SejourModel> {
        const sejourEntity = SejourMapper.toEntity(sejour);
        const createdSejour = await this.sejourMongooseEntity.create(sejourEntity);
        return SejourMapper.toModel(createdSejour);
    }

    async findById(id: string): Promise<SejourModel> {
        const sejour = await this.sejourMongooseEntity.findById(id);
        if (!sejour) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return SejourMapper.toModel(sejour);
    }
    async update(sejour: SejourModel, updateOriginName?: string): Promise<SejourModel> {
        const sejourEntity = SejourMapper.toEntity(sejour);
        const retrievedSejour = await this.sejourMongooseEntity.findById(sejour.id);
        if (!retrievedSejour) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedSejour.set(sejourEntity);
        const user = updateOriginName ? { firstName: updateOriginName } : this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedSejour.save({ fromUser: user, session: this.dbSessionGateway.get() });
        return SejourMapper.toModel(retrievedSejour);
    }

    async findAll(): Promise<SejourModel[]> {
        const sejours = await this.sejourMongooseEntity.find();
        return SejourMapper.toModels(sejours);
    }

    async findBySessionId(sessionId: string): Promise<SejourModel[]> {
        const sejours = await this.sejourMongooseEntity.find({ cohortId: sessionId });
        return SejourMapper.toModels(sejours);
    }
}
