import { CreatePlanDeTransportModel, PlanDeTransportModel } from "./PlanDeTransport.model";

export interface PlanDeTransportGateway {
    findById(id: string): Promise<PlanDeTransportModel>;
    findByIds(ids: string[]): Promise<PlanDeTransportModel[]>;
    findBySessionId(sessionId: string): Promise<PlanDeTransportModel[]>;
    findBySessionNom(sessionNom: string): Promise<PlanDeTransportModel[]>;
    update(planDeTransport: PlanDeTransportModel): Promise<PlanDeTransportModel>;
    bulkUpdate(planDeTransports: PlanDeTransportModel[]): Promise<number>;
    delete(planDeTransport: PlanDeTransportModel): Promise<void>;
    create(planDeTransport: CreatePlanDeTransportModel): Promise<PlanDeTransportModel>;
}

export const PlanDeTransportGateway = Symbol("PlanDeTransportGateway");
