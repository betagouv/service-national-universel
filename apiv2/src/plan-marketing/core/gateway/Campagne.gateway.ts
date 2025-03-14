import {
    CampagneEnvoi,
    CampagneModel,
    CampagneSpecifiqueModelWithRefAndGeneric,
    CampagneSpecifiqueModelWithoutRef,
    CreateCampagneModel,
} from "../Campagne.model";

export interface CampagneGateway {
    save(campagne: CreateCampagneModel): Promise<CampagneModel>;
    findById(id: string): Promise<CampagneModel | null>;
    search(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<CampagneModel[]>;
    update(campagne: CampagneModel): Promise<CampagneModel | null>;
    delete(id: string): Promise<void>;
    updateAndRemoveRef(campagne: CampagneModel): Promise<CampagneModel | null>;
    findSpecifiqueWithRefById(id: string): Promise<CampagneSpecifiqueModelWithRefAndGeneric | null>;
    findSpecifiqueWithoutRefById(id: string): Promise<CampagneSpecifiqueModelWithoutRef | null>;
    addEnvoiToCampagneById(campagneId: string, envoi: CampagneEnvoi): Promise<CampagneModel | null>;
}

export const CampagneGateway = Symbol("CampagneGateway");
