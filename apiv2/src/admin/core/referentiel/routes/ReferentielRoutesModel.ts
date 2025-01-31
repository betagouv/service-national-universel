import { FileValidation } from "../Referentiel";

export interface RouteXlsx {
    "Session formule"?: string;
    "Code court de Route"?: string;
    "Commentaire interne sur l'enregistrement"?: string;
    "Session : Code de la session"?: string;
    "Session : Désignation de la session"?: string;
    "Session : Date de début de la session"?: string;
    "Session : Date de fin de la session"?: string;
    Route?: string;
    "Code point de rassemblement initial"?: string;
    "Point de rassemblement initial"?: string;
    "ID PI"?: string;
    "Code point intermédiaire 1"?: string;
    "Point intermédiaire 1"?: string;
    "ID PI 1"?: string;
    "Code point intermédiaire 2"?: string;
    "Point intermédiaire 2"?: string;
    "ID PI 2"?: string;
    "Code point intermédiaire 3"?: string;
    "Point intermédiaire 3"?: string;
    "ID PI 3"?: string;
    "Code point intermédiaire 4"?: string;
    "Point intermédiaire 4"?: string;
    "ID PI 4"?: string;
    "Désignation du centre"?: string;
    "Centre de référence"?: string;
    Commune?: string;
    "ID Temporaire Centre de Session"?: string;
    "Effectif de jeunes concernés"?: string;
    "Nombre d'accompagnants"?: string;
    "Classe engagée"?: string;
    "Identifiant de la classe engagée"?: string;
}

export interface RouteImportModel {
    sessionCode: string;
    routeCode: string;
    routeName: string;
    routeDescription: string;
}

export interface RouteRapport {}
export interface RouteImportRapport extends RouteImportModel, RouteRapport {
    result: "success" | "error";
    error?: string;
    updated?: string;
}

export const RouteImportFileValidation: FileValidation = {
    requiredColumns: [
        "Session formule",
        "Code court de Route",
        "Commentaire interne sur l'enregistrement",
        "Session : Code de la session",
        "Session : Désignation de la session",
        "Session : Date de début de la session",
        "Session : Date de fin de la session",
        "Route",
            : "Code point de rassemblement initial",
    point_rassemblement: "Point de rassemblement initial"
    ],
    sheetName: "",
};
