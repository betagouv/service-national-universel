import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ClientSession, Model } from "mongoose";
import { ClsService } from "nestjs-cls";

import { PlanDeTransportGateway } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.gateway";
import { PlanDeTransportModel } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.model";
import { PLANDETRANSPORT_MONGOOSE_ENTITY, PlanDeTransportDocument } from "../../provider/PlanDeTransportMongo.provider";

import { PlanDeTransportMapper } from "../PlanDeTransport.mapper";
import { DbSessionGateway } from "@shared/core/DbSession.gateway";

@Injectable()
export class PlanDeTransportRepository implements PlanDeTransportGateway {
    constructor(
        @Inject(PLANDETRANSPORT_MONGOOSE_ENTITY) private planDeTransportMongooseEntity: Model<PlanDeTransportDocument>,
        @Inject(DbSessionGateway) private readonly dbSessionGateway: DbSessionGateway<ClientSession>,
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
    async update(planDeTransport: PlanDeTransportModel, updateOriginName: string): Promise<PlanDeTransportModel> {
        const planDeTransportEntity = PlanDeTransportMapper.toEntity(planDeTransport);
        const retrievedPlanDeTransport = await this.planDeTransportMongooseEntity.findById(planDeTransport.id);
        if (!retrievedPlanDeTransport) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedPlanDeTransport.set(planDeTransportEntity);
        const user = updateOriginName ? { firstName: updateOriginName } : this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedPlanDeTransport.save({ fromUser: user, session: this.dbSessionGateway.get() });
        return PlanDeTransportMapper.toModel(retrievedPlanDeTransport);
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
}
