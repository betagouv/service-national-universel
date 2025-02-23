import { CreateSejourModel, SejourModel } from "./Sejour.model";

export interface SejourGateway {
    findById(id: string): Promise<SejourModel | null>;
    findByIds(id: string[]): Promise<SejourModel[]>;
    findBySessionId(sessionId: string): Promise<SejourModel[]>;
    update(sejour: SejourModel): Promise<SejourModel>;
    bulkUpdate(sejours: SejourModel[]): Promise<number>;
    findBySejourSnuId(sejourSnuId: string): Promise<SejourModel | null>;
    create(session: CreateSejourModel): Promise<SejourModel>;
}

export const SejourGateway = Symbol("SejourGateway");
