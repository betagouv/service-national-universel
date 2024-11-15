import { JeuneModel, CreateJeuneModel } from "./Jeune.model";

export interface JeuneGateway {
    findAll(): Promise<JeuneModel[]>;
    findById(id: string): Promise<JeuneModel>;
    findBySessionIdAndStatusForDepartementMetropole(id: string, status: string): Promise<JeuneModel[]>;
    update(classe: JeuneModel): Promise<JeuneModel>;
    create(classe: CreateJeuneModel): Promise<JeuneModel>;
}

export const JeuneGateway = Symbol("JeuneGateway");
