import { ListeDiffusionEnum, ListeDiffusionFiltres } from "snu-lib";

export interface ListeDiffusionModel {
    id: string;
    nom: string;
    type: ListeDiffusionEnum;
    filters: ListeDiffusionFiltres;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateListeDiffusionModel = Omit<ListeDiffusionModel, "id" | "createdAt" | "updatedAt">;

export type UpdateListeDiffusionModel = Omit<ListeDiffusionModel, "type" | "createdAt" | "updatedAt">;

export interface ColumnCsvName {
    type: ColumnType;
    PRENOM?: string;
    NOM?: string;
    EMAIL?: string;
    COHORT?: string;
    CENTRE?: string;
    VILLECENTRE?: string;
    PRENOM_RL1?: string;
    NOM_RL1?: string;
    PRENOM_RL2?: string;
    NOM_RL2?: string;
    PRENOMVOLONTAIRE?: string;
    NOMVOLONTAIRE?: string;
    PDR_ALLER?: string;
    PDR_ALLER_ADRESSE?: string;
    PDR_ALLER_VILLE?: string;
    DATE_ALLER?: string;
    HEURE_ALLER?: string;
    PDR_RETOUR?: string;
    PDR_RETOUR_VILLE?: string;
    PDR_RETOUR_ADRESSE?: string;
    DATE_RETOUR?: string;
    HEURE_RETOUR?: string;
}

export enum ColumnType {
    jeunes = "jeunes",
    representants = "representants",
}
