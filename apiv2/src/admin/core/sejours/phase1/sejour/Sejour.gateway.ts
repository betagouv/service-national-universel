import { SejourModel } from "./Sejour.model";

export interface SejourGateway {
    findById(id: string): Promise<SejourModel>;
    findBySessionId(sessionId: string): Promise<SejourModel[]>;
}

export const SejourGateway = Symbol("SejourGateway");
