import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";

import { PlanDeTransportGateway } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.gateway";
import { PlanDeTransportModel } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.model";
import {
    PLANDETRANSPORT_MONGOOSE_ENTITY,
    PLANDETRANSPORT_PATCHHISTORY_OPTIONS,
    PlanDeTransportDocument,
} from "../../provider/PlanDeTransportMongo.provider";

import { PlanDeTransportMapper } from "../PlanDeTransport.mapper";
import { HistoryType } from "@admin/core/history/History";
import { HistoryMapper } from "@admin/infra/history/repository/HistoryMapper";
import { HistoryGateway } from "@admin/core/history/History.gateway";
import { getEntityUpdateSetUnset } from "@shared/infra/RepositoryHelper";

@Injectable()
export class PlanDeTransportRepository implements PlanDeTransportGateway {
    constructor(
        @Inject(PLANDETRANSPORT_MONGOOSE_ENTITY) private planDeTransportMongooseEntity: Model<PlanDeTransportDocument>,
        @Inject(HistoryGateway) private historyGateway: HistoryGateway,
        private readonly cls: ClsService,
    ) {}

    async create(planDeTransport: PlanDeTransportModel): Promise<PlanDeTransportModel> {
        const planDeTransportEntity = PlanDeTransportMapper.toEntity(planDeTransport);
        const createdPlanDeTransport = await this.planDeTransportMongooseEntity.create(planDeTransportEntity);
        return PlanDeTransportMapper.toModel(createdPlanDeTransport);
    }

    async findById(id: string): Promise<PlanDeTransportModel> {
        const planDeTransport = await this.planDeTransportMongooseEntity.findById(id);
        if (!planDeTransport) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return PlanDeTransportMapper.toModel(planDeTransport);
    }
    async update(planDeTransport: PlanDeTransportModel): Promise<PlanDeTransportModel> {
        const planDeTransportEntity = PlanDeTransportMapper.toEntity(planDeTransport);
        const retrievedPlanDeTransport = await this.planDeTransportMongooseEntity.findById(planDeTransport.id);
        if (!retrievedPlanDeTransport) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedPlanDeTransport.set(planDeTransportEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedPlanDeTransport.save({ fromUser: user });
        return PlanDeTransportMapper.toModel(retrievedPlanDeTransport);
    }

    async findByIds(ids: string[]): Promise<PlanDeTransportModel[]> {
        const pdts = await this.planDeTransportMongooseEntity.find({ _id: { $in: ids } });
        return PlanDeTransportMapper.toModels(pdts);
    }

    async findAll(): Promise<PlanDeTransportModel[]> {
        const planDeTransports = await this.planDeTransportMongooseEntity.find();
        return PlanDeTransportMapper.toModels(planDeTransports);
    }

    async findBySessionId(sessionId: string): Promise<PlanDeTransportModel[]> {
        const planDeTransports = await this.planDeTransportMongooseEntity.find({ cohortId: sessionId });
        return PlanDeTransportMapper.toModels(planDeTransports);
    }

    async findBySessionNom(sessionNom: string): Promise<PlanDeTransportModel[]> {
        const planDeTransports = await this.planDeTransportMongooseEntity.find({ cohort: sessionNom });
        return PlanDeTransportMapper.toModels(planDeTransports);
    }

    async bulkUpdate(pdtsUpdated: PlanDeTransportModel[]): Promise<number> {
        const pdtsOriginal = await this.findByIds(pdtsUpdated.map((pdt) => pdt.id));
        if (pdtsOriginal.length !== pdtsUpdated.length) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }

        const pdtsEntity = pdtsUpdated.map((updated) => ({
            original: PlanDeTransportMapper.toEntity(pdtsOriginal.find(({ id }) => updated.id === id)!),
            updated: PlanDeTransportMapper.toEntity(updated),
        }));

        const user = this.cls.get("user");

        const updatePdts = await this.planDeTransportMongooseEntity.bulkWrite(
            pdtsEntity.map((pdt) => ({
                updateOne: {
                    filter: { _id: pdt.updated._id },
                    update: getEntityUpdateSetUnset(pdt.updated),
                    upsert: false,
                },
            })),
        );

        await this.historyGateway.bulkCreate(
            HistoryType.PLANDETRANSPORT,
            HistoryMapper.toUpdateHistories(pdtsEntity, PLANDETRANSPORT_PATCHHISTORY_OPTIONS, user),
        );

        return updatePdts.modifiedCount;
    }

    async delete(planDeTransport: PlanDeTransportModel): Promise<void> {
        const retrievedPlanDeTransport = await this.planDeTransportMongooseEntity.findById(planDeTransport.id);
        if (!retrievedPlanDeTransport) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        await retrievedPlanDeTransport.deleteOne();
    }
}
