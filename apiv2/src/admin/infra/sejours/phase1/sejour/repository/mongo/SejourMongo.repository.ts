import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import {
    SEJOUR_MONGOOSE_ENTITY,
    SEJOUR_PATCHHISTORY_OPTIONS,
    SejourDocument,
} from "../../provider/SejourMongo.provider";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";
import { SejourModel } from "@admin/core/sejours/phase1/sejour/Sejour.model";
import { SejourMapper } from "../Sejour.mapper";
import { HistoryGateway } from "@admin/core/history/History.gateway";
import { HistoryType } from "@admin/core/history/History";
import { HistoryMapper } from "@admin/infra/history/repository/HistoryMapper";
import { getEntityUpdateSetUnset } from "@shared/infra/RepositoryHelper";

@Injectable()
export class SejourRepository implements SejourGateway {
    constructor(
        @Inject(SEJOUR_MONGOOSE_ENTITY) private sejourMongooseEntity: Model<SejourDocument>,
        @Inject(HistoryGateway) private historyGateway: HistoryGateway,
        private readonly cls: ClsService,
    ) {}
    async findBySejourSnuId(sejourSnuId: string): Promise<SejourModel | null> {
        const sejour = await this.sejourMongooseEntity.findOne({ sejourSnuIds: sejourSnuId });
        if (!sejour) {
            return null;
        }
        return SejourMapper.toModel(sejour);
    }

    async create(sejour: SejourModel): Promise<SejourModel> {
        const sejourEntity = SejourMapper.toEntity(sejour);
        const createdSejour = await this.sejourMongooseEntity.create(sejourEntity);
        return SejourMapper.toModel(createdSejour);
    }

    async findById(id: string): Promise<SejourModel | null> {
        const sejour = await this.sejourMongooseEntity.findById(id);
        if (!sejour) {
            return null;
        }
        return SejourMapper.toModel(sejour);
    }
    async findAll(): Promise<SejourModel[]> {
        const sejours = await this.sejourMongooseEntity.find();
        return SejourMapper.toModels(sejours);
    }

    async update(sejour: SejourModel): Promise<SejourModel> {
        const sejourEntity = SejourMapper.toEntity(sejour);
        const retrievedSejour = await this.sejourMongooseEntity.findById(sejour.id);
        if (!retrievedSejour) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedSejour.set(sejourEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedSejour.save({ fromUser: user });
        return SejourMapper.toModel(retrievedSejour);
    }

    async findByIds(ids: string[]): Promise<SejourModel[]> {
        const sejours = await this.sejourMongooseEntity.find({ _id: { $in: ids } });
        return SejourMapper.toModels(sejours);
    }

    async findBySessionId(sessionId: string): Promise<SejourModel[]> {
        const sejours = await this.sejourMongooseEntity.find({ cohortId: sessionId });
        return SejourMapper.toModels(sejours);
    }

    async bulkUpdate(sejoursUpdated: SejourModel[]): Promise<number> {
        const sejoursOriginal = await this.findByIds(sejoursUpdated.map((sejour) => sejour.id));
        if (sejoursOriginal.length !== sejoursUpdated.length) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }

        const sejoursEntity = sejoursUpdated.map((updated) => ({
            original: SejourMapper.toEntity(sejoursOriginal.find(({ id }) => updated.id === id)!),
            updated: SejourMapper.toEntity(updated),
        }));

        const user = this.cls.get("user");

        const updateSejours = await this.sejourMongooseEntity.bulkWrite(
            sejoursEntity.map((sejour) => ({
                updateOne: {
                    filter: { _id: sejour.updated._id },
                    update: getEntityUpdateSetUnset(sejour.updated),
                    upsert: false,
                },
            })),
        );

        await this.historyGateway.bulkCreate(
            HistoryType.SEJOUR,
            HistoryMapper.toUpdateHistories(sejoursEntity, SEJOUR_PATCHHISTORY_OPTIONS, user),
        );

        return updateSejours.modifiedCount;
    }
}
