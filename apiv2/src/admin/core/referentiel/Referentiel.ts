import { ReferentielTaskType } from "snu-lib";
import { ImportClasseFileValidation } from "./classe/ReferentielClasse.model";

export enum FilePath {
    CLASSES = "file/si-snu/classes",
}

export const IMPORT_TAB_NAMES =  {
    [ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES]: "",
    [ReferentielTaskType.IMPORT_ROUTES]: "",
    [ReferentielTaskType.IMPORT_CLASSES]: ImportClasseFileValidation.sheetName,
}

export const REGION_ACADEMIQUE_COLUMN_NAMES = {
    code: "Code région académique",
    libelle: "Région académique : Libellé région académique long",
    zone: "Zone région académique édition",
    date_derniere_modification_si: "Région académique : Date de dernière modification"
};

export const ROUTE_COLUMN_NAMES = {
    session_formule: "Session formule",
    code_court_route: "Code court de Route",
    commentaire_interne: "Commentaire interne sur l'enregistrement",
    session_code: "Session : Code de la session",
    session_designation: "Session : Désignation de la session",
    session_date_debut: "Session : Date de début de la session",
    session_date_fin: "Session : Date de fin de la session",
    route: "Route",
    code_point_rassemblement: "Code point de rassemblement initial",
    point_rassemblement: "Point de rassemblement initial"
};

export const CLASSE_COLUMN_NAMES = {
    session_formule: "Session formule",
    identifiant_classe: "Identifiant de la classe engagée",
    effectif_jeunes: "Effectif de jeunes concernés",
    session_code: "Session : Code de la session",
    centre: "Désignation du centre",
    code_point_rassemblement: "Code point de rassemblement initial",
};

export const IMPORT_REQUIRED_COLUMN_NAMES = {
    [ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES]: Object.values(REGION_ACADEMIQUE_COLUMN_NAMES),
    [ReferentielTaskType.IMPORT_ROUTES]: Object.values(ROUTE_COLUMN_NAMES),
    [ReferentielTaskType.IMPORT_CLASSES]: Object.values(CLASSE_COLUMN_NAMES),
};

