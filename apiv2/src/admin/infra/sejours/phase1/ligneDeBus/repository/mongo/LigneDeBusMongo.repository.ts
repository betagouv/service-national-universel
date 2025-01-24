import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import {
    LIGNEDEBUS_MONGOOSE_ENTITY,
    LIGNEDEBUS_PATCHHISTORY_OPTIONS,
    LigneDeBusDocument,
} from "../../provider/LigneDeBusMongo.provider";
import { LigneDeBusModel } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";
import { LigneDeBusMapper } from "../LigneDeBus.mapper";
import { HistoryGateway } from "@admin/core/history/History.gateway";
import { HistoryType } from "@admin/core/history/History";
import { HistoryMapper } from "@admin/infra/history/repository/HistoryMapper";
import { getEntityUpdateSetUnset } from "@shared/infra/RepositoryHelper";

@Injectable()
export class LigneDeBusRepository implements LigneDeBusGateway {
    constructor(
        @Inject(LIGNEDEBUS_MONGOOSE_ENTITY) private ligneDeBusMongooseEntity: Model<LigneDeBusDocument>,
        @Inject(HistoryGateway) private historyGateway: HistoryGateway,
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
    async update(ligneDeBus: LigneDeBusModel): Promise<LigneDeBusModel> {
        const ligneDeBusEntity = LigneDeBusMapper.toEntity(ligneDeBus);
        const retrievedLigneDeBus = await this.ligneDeBusMongooseEntity.findById(ligneDeBus.id);
        if (!retrievedLigneDeBus) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedLigneDeBus.set(ligneDeBusEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedLigneDeBus.save({ fromUser: user });
        return LigneDeBusMapper.toModel(retrievedLigneDeBus);
    }

    async findByIds(ids: string[]): Promise<LigneDeBusModel[]> {
        const ligneDeBus = await this.ligneDeBusMongooseEntity.find({ _id: { $in: ids } });
        return LigneDeBusMapper.toModels(ligneDeBus);
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

    async bulkUpdate(lignesUpdated: LigneDeBusModel[]): Promise<number> {
        const lignesOriginal = await this.findByIds(lignesUpdated.map((ligne) => ligne.id));
        if (lignesOriginal.length !== lignesUpdated.length) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }

        const lignesEntity = lignesUpdated.map((updated) => ({
            original: LigneDeBusMapper.toEntity(lignesOriginal.find(({ id }) => updated.id === id)!),
            updated: LigneDeBusMapper.toEntity(updated),
        }));

        const user = this.cls.get("user");

        const updateLignes = await this.ligneDeBusMongooseEntity.bulkWrite(
            lignesEntity.map((ligne) => ({
                updateOne: {
                    filter: { _id: ligne.updated._id },
                    update: getEntityUpdateSetUnset(ligne.updated),
                    upsert: false,
                },
            })),
        );

        await this.historyGateway.bulkCreate(
            HistoryType.LIGNEDEBUS,
            HistoryMapper.toUpdateHistories(lignesEntity, LIGNEDEBUS_PATCHHISTORY_OPTIONS, user),
        );

        return updateLignes.modifiedCount;
    }

    async delete(ligneDeBus: LigneDeBusModel): Promise<void> {
        const retrievedLigneDeBus = await this.ligneDeBusMongooseEntity.findById(ligneDeBus.id);
        if (!retrievedLigneDeBus) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        await retrievedLigneDeBus.deleteOne();
    }
}
