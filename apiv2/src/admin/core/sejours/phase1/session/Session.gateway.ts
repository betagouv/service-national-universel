import { SessionModel } from "./Session.model";

export interface SessionGateway {
    findById(id: string): Promise<SessionModel>;
}
export const SessionGateway = Symbol("SessionGateway");
