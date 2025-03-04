import { CampagneModel, CreateCampagneModel } from "../Campagne.model";

export interface CampagneGateway {
    save(campagne: CreateCampagneModel): Promise<CampagneModel>;
    findById(id: string): Promise<CampagneModel | null>;
    search(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<CampagneModel[]>;
    update(campagne: CampagneModel): Promise<CampagneModel | null>;
    delete(id: string): Promise<void>;
    getAllCampagnes(): Promise<any[]>;
}

export const CampagneGateway = Symbol("CampagneGateway");
