import { JeuneModel, CreateJeuneModel } from "./Jeune.model";

export interface JeuneGateway {
    findAll(): Promise<JeuneModel[]>;
    findById(id: string): Promise<JeuneModel>;
    findBySessionIdStatusNiveauScolairesAndDepartements(
        sessionId: string,
        status: string,
        niveauScolaires: string[],
        departements: string[],
    ): Promise<JeuneModel[]>;
    findBySessionId(sessionId: string): Promise<JeuneModel[]>;
    update(classe: JeuneModel): Promise<JeuneModel>;
    create(classe: CreateJeuneModel): Promise<JeuneModel>;
}

export const JeuneGateway = Symbol("JeuneGateway");
