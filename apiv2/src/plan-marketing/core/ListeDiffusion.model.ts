import exp from "constants";
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

export const COLUMN_CSV_HEADERS: (keyof ColumnCsvName)[] = [
    "type",
    "PRENOM",
    "NOM",
    "EMAIL",
    "COHORT",
    "CENTRE",
    "VILLECENTRE",
    "PRENOM_RL1",
    "NOM_RL1",
    "PRENOM_RL2",
    "NOM_RL2",
    "PRENOMVOLONTAIRE",
    "NOMVOLONTAIRE",
    "PDR_ALLER",
    "PDR_ALLER_ADRESSE",
    "PDR_ALLER_VILLE",
    "DATE_ALLER",
    "HEURE_ALLER",
    "PDR_RETOUR",
    "PDR_RETOUR_VILLE",
    "PDR_RETOUR_ADRESSE",
    "DATE_RETOUR",
    "HEURE_RETOUR",
];

export enum ColumnType {
    jeunes = "jeunes",
    referents = "referents",
    representants = "representants",
    "chefs-etablissement" = "chefs-etablissement",
    administrateurs = "administrateurs",
    "chefs-centres" = "chefs-centres",
}
