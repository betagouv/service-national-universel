import { CreateLigneDeBusModel, LigneDeBusModel } from "./LigneDeBus.model";

export interface LigneDeBusGateway {
    findById(id: string): Promise<LigneDeBusModel>;
    findByIds(ids: string[]): Promise<LigneDeBusModel[]>;
    findBySessionIdAndClasseId(sessionId: string, classeId: string): Promise<LigneDeBusModel | null>;
    findBySessionId(sessionId: string): Promise<LigneDeBusModel[]>;
    findBySessionNom(sessionNom: string): Promise<LigneDeBusModel[]>;
    update(ligneDeBus: LigneDeBusModel): Promise<LigneDeBusModel>;
    bulkUpdate(ligneDeBusList: LigneDeBusModel[]): Promise<number>;
    delete(ligneDeBus: LigneDeBusModel): Promise<void>;
    create(ligneDeBus: CreateLigneDeBusModel): Promise<LigneDeBusModel>;
}

export const LigneDeBusGateway = Symbol("LigneDeBusGateway");
