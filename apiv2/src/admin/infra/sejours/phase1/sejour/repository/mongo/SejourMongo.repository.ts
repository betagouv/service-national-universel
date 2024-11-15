import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { SEJOUR_MONGOOSE_ENTITY, SejourDocument } from "../../provider/SejourMongo.provider";
import { SejourGateway } from "src/admin/core/sejours/phase1/sejour/Sejour.gateway";
import { SejourModel } from "src/admin/core/sejours/phase1/sejour/Sejour.model";
import { SejourMapper } from "../Sejour.mapper";

@Injectable()
export class SejourRepository implements SejourGateway {
    constructor(
        @Inject(SEJOUR_MONGOOSE_ENTITY) private sejourtMongooseEntity: Model<SejourDocument>,
        private readonly cls: ClsService,
    ) {}

    async create(sejourt: SejourModel): Promise<SejourModel> {
        const sejourtEntity = SejourMapper.toEntity(sejourt);
        const createdSejour = await this.sejourtMongooseEntity.create(sejourtEntity);
        return SejourMapper.toModel(createdSejour);
    }

    async findById(id: string): Promise<SejourModel> {
        const sejourt = await this.sejourtMongooseEntity.findById(id);
        if (!sejourt) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return SejourMapper.toModel(sejourt);
    }
    async update(sejourt: SejourModel): Promise<SejourModel> {
        const sejourtEntity = SejourMapper.toEntity(sejourt);
        const retrievedSejour = await this.sejourtMongooseEntity.findById(sejourt.id);
        if (!retrievedSejour) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedSejour.set(sejourtEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedSejour.save({ fromUser: user });
        return SejourMapper.toModel(retrievedSejour);
    }

    async findAll(): Promise<SejourModel[]> {
        const sejourts = await this.sejourtMongooseEntity.find();
        return SejourMapper.toModels(sejourts);
    }

    async findBySessionId(sessionId: string): Promise<SejourModel[]> {
        const sejourts = await this.sejourtMongooseEntity.find({ cohortId: sessionId });
        return SejourMapper.toModels(sejourts);
    }
}
