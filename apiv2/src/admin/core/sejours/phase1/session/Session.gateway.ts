import { CreateSessionModel, SessionModel } from "./Session.model";

export interface SessionGateway {
    findById(id: string): Promise<SessionModel>;
    findBySnuId(snuId: string): Promise<SessionModel | null>;
    create(session: CreateSessionModel): Promise<SessionModel>;
}
export const SessionGateway = Symbol("SessionGateway");
