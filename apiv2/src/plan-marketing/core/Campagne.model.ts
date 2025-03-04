import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";

export interface CampagneModel {
    id: string;
    campagneGeneriqueId?: string;
    nom: string;
    objet: string;
    contexte?: string;
    templateId: number;
    listeDiffusionId: string;
    generic: boolean;
    destinataires: DestinataireListeDiffusion[];
    type: CampagneJeuneType;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateCampagneModel = Omit<CampagneModel, "id" | "createdAt" | "updatedAt">;
