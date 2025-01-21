import { LigneDeBusModel } from "./LigneDeBus.model";

export interface LigneDeBusGateway {
    findById(id: string): Promise<LigneDeBusModel>;
    findByIds(ids: string[]): Promise<LigneDeBusModel[]>;
    findBySessionId(sessionId: string): Promise<LigneDeBusModel[]>;
    findBySessionNom(sessionNom: string): Promise<LigneDeBusModel[]>;
    update(ligneDeBus: LigneDeBusModel): Promise<LigneDeBusModel>;
    bulkUpdate(ligneDeBusList: LigneDeBusModel[]): Promise<number>;
    delete(ligneDeBus: LigneDeBusModel): Promise<void>;
}

export const LigneDeBusGateway = Symbol("LigneDeBusGateway");
