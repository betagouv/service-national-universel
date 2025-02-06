import { CreateSessionModel, SessionModel } from "./Session.model";
import { COHORT_TYPE, COHORT_STATUS } from "snu-lib";

export interface SessionGateway {
    findById(id: string): Promise<SessionModel>;
    findBySnuId(snuId: string): Promise<SessionModel | null>;
    create(session: CreateSessionModel): Promise<SessionModel>;
    findByElligibility(type: keyof typeof COHORT_TYPE, statut: keyof typeof COHORT_STATUS): Promise<SessionModel[]>;
}
export const SessionGateway = Symbol("SessionGateway");
