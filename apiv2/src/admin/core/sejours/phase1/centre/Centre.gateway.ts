import { CentreModel } from "./Centre.model";

export interface CentreGateway {
    findById(id: string): Promise<CentreModel>;
    findBySessionId(sessionId: string): Promise<CentreModel[]>;
    findByMatricule(code: string): Promise<CentreModel | null>;
    findByIds(ids: string[]): Promise<CentreModel[]>;
}

export const CentreGateway = Symbol("CentreGateway");
