import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { CENTRE_MONGOOSE_ENTITY, CentreDocument } from "../../provider/CentreMongo.provider";
import { CentreMapper } from "../Centre.mapper";
import { CentreModel } from "@admin/core/sejours/phase1/centre/Centre.model";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";

@Injectable()
export class CentreRepository implements CentreGateway {
    constructor(
        @Inject(CENTRE_MONGOOSE_ENTITY) private centreMongooseEntity: Model<CentreDocument>,

        private readonly cls: ClsService,
    ) {}

    async create(centre: CentreModel): Promise<CentreModel> {
        const centreEntity = CentreMapper.toEntity(centre);
        const createdCentre = await this.centreMongooseEntity.create(centreEntity);
        return CentreMapper.toModel(createdCentre);
    }

    async findById(id: string): Promise<CentreModel> {
        const centre = await this.centreMongooseEntity.findById(id);
        if (!centre) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return CentreMapper.toModel(centre);
    }
    async update(centre: CentreModel): Promise<CentreModel> {
        const centreEntity = CentreMapper.toEntity(centre);
        const retrievedCentre = await this.centreMongooseEntity.findById(centre.id);
        if (!retrievedCentre) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedCentre.set(centreEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedCentre.save({ fromUser: user });
        return CentreMapper.toModel(retrievedCentre);
    }

    async findAll(): Promise<CentreModel[]> {
        const centres = await this.centreMongooseEntity.find();
        return CentreMapper.toModels(centres);
    }

    async findBySessionId(sessionId: string): Promise<CentreModel[]> {
        const centres = await this.centreMongooseEntity.find({ cohortIds: sessionId });
        return CentreMapper.toModels(centres);
    }
}
