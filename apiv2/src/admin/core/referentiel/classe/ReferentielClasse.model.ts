import { STATUS_CLASSE } from "snu-lib";
import { FileValidation } from "../Referentiel";

export interface ClasseImportXlsx {
    "Session formule": string;
    "Identifiant de la classe engagée": string;
    "Effectif de jeunes concernés": number;
    "Session : Code de la session"?: string;
    "Désignation du centre": string;
    "Code point de rassemblement initial"?: string;
}

export interface ClasseImportModel {
    cohortCode: string;
    classeId: string;
    classeTotalSeats?: number;
    centerCode?: string;
    pdrCode?: string;
    sessionCode: string;
}

export interface ClasseRapport {}
export interface ClasseImportRapport extends ClasseImportModel, ClasseRapport {
    classeStatus?: keyof typeof STATUS_CLASSE;
    sessionId?: string;
    sessionName?: string;
    result?: "success" | "error";
    error?: string;
    updated?: string;
    annulerClasseDesisteeId?: string;
    annulerClasseDesisteeRapport?: string;
}

export interface ClasseDesisterXlsx {
    "Identifiant de la classe engagée"?: string;
}

export interface ClasseDesisterModel {
    classeId?: string;
}

export interface ClasseDesisterRapport extends ClasseRapport {
    classeId?: string;
    result: "success" | "error";
    jeunesDesistesIds: string;
    error?: string;
}

export const ImportClasseFileValidation: FileValidation = {
    requiredColumns: [
        "Session formule",
        "Identifiant de la classe engagée",
        "Effectif de jeunes concernés",
        "Session : Code de la session",
        "Désignation du centre",
    ],
    sheetName: "CLE 2025",
};

export const DesisterClasseFileValidation: FileValidation = {
    requiredColumns: ["Identifiant de la classe engagée"],
    sheetName: "CLASSES DESISTEES",
};
