import { CandidatureModel } from "./Candidature.model";

export interface CandidatureGateway {
    findById(id: string): Promise<CandidatureModel>;
    findByIds(ids: string[]): Promise<CandidatureModel[]>;
    findByStructureId(id: string): Promise<CandidatureModel[]>;
    findByStructureIds(ids: string[]): Promise<CandidatureModel[]>;
}

export const CandidatureGateway = Symbol("CandidatureGateway");
