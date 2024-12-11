import { PlanDeTransportModel } from "./PlanDeTransport.model";

export interface PlanDeTransportGateway {
    findById(id: string): Promise<PlanDeTransportModel>;
    findBySessionId(sessionId: string): Promise<PlanDeTransportModel[]>;
    findBySessionNom(sessionNom: string): Promise<PlanDeTransportModel[]>;
    update(PlanDeTransport: PlanDeTransportModel, updateOriginName?: string): Promise<PlanDeTransportModel>;
}

export const PlanDeTransportGateway = Symbol("PlanDeTransportGateway");
