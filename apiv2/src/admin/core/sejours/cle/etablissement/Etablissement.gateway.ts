import { CreateEtablissementModel, EtablissementModel } from "./Etablissement.model";

export interface EtablissementGateway {
    findById(id: string): Promise<EtablissementModel>;
    findByIds(ids: string[]): Promise<EtablissementModel[]>;
    create(etablissement: CreateEtablissementModel): Promise<EtablissementModel>;
}

export const EtablissementGateway = Symbol("EtablissementGateway");
