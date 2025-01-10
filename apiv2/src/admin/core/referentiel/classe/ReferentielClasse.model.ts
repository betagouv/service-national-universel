import { STATUS_CLASSE } from "snu-lib";

export interface ClasseImportXslx {
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

export interface ClasseImportReport extends ClasseImportModel {
    classeStatus?: keyof typeof STATUS_CLASSE;
    sessionId?: string;
    sessionName?: string;
    result?: "success" | "error";
    error?: string;
    updatedFields?: string[];
}
