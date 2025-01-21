import { SejourModel } from "./Sejour.model";

export interface SejourGateway {
    findById(id: string): Promise<SejourModel>;
    findByIds(id: string[]): Promise<SejourModel[]>;
    findBySessionId(sessionId: string): Promise<SejourModel[]>;
    update(sejour: SejourModel): Promise<SejourModel>;
    bulkUpdate(sejours: SejourModel[]): Promise<number>;
    findBySejourSnuId(sejourSnuId: string): Promise<SejourModel | null>;
}

export const SejourGateway = Symbol("SejourGateway");
