import { LigneDeBusModel } from "./LigneDeBus.model";

export interface LigneDeBusGateway {
    findById(id: string): Promise<LigneDeBusModel>;
    findBySessionId(sessionId: string): Promise<LigneDeBusModel[]>;
    findBySessionNom(sessionNom: string): Promise<LigneDeBusModel[]>;
    update(ligneDeBus: LigneDeBusModel, updateOriginName?: string): Promise<LigneDeBusModel>;
}

export const LigneDeBusGateway = Symbol("LigneDeBusGateway");
