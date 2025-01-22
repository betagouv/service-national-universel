import { JeuneModel, CreateJeuneModel } from "./Jeune.model";

export interface JeuneGateway {
    findAll(): Promise<JeuneModel[]>;
    findById(id: string): Promise<JeuneModel>;
    findByIds(ids: string[]): Promise<JeuneModel[]>;
    findBySessionIdStatusNiveauScolairesAndDepartements(
        sessionId: string,
        status: string,
        niveauScolaires: string[],
        departements: string[],
    ): Promise<JeuneModel[]>;
    findBySessionId(sessionId: string): Promise<JeuneModel[]>;
    update(jeune: JeuneModel): Promise<JeuneModel>;
    updateSession(
        jeune: Pick<
            JeuneModel,
            "id" | "sessionId" | "sessionNom" | "originalSessionId" | "originalSessionNom" | "sessionChangeReason"
        >,
    ): Promise<void>;
    bulkUpdate(jeunesUpdated: JeuneModel[]): Promise<number>;
    create(jeune: CreateJeuneModel): Promise<JeuneModel>;
    countAffectedByLigneDeBus(ligneDeBusId: string): Promise<number>;
    findByClasseId(classeId: string): Promise<JeuneModel[]>;
}

export const JeuneGateway = Symbol("JeuneGateway");
