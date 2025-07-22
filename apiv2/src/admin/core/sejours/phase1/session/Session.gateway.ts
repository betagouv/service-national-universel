import { CreateSessionModel, SessionModel } from "./Session.model";

export interface SessionGateway {
    findById(id: string): Promise<SessionModel>;
    findByName(name: string): Promise<SessionModel>;
    findBySnuId(snuId: string): Promise<SessionModel | null>;
    findByGroupIdStatusAndEligibility(
        status: string,
        cohortGroupId: string,
        {
            dateNaissance,
            niveauScolaire,
            departement,
        }: { dateNaissance: Date; niveauScolaire: string; departement: string },
    ): Promise<SessionModel[]>;
    findByDateEndAfter(date: Date): Promise<SessionModel[]>;
    create(session: CreateSessionModel): Promise<SessionModel>;
}
export const SessionGateway = Symbol("SessionGateway");
