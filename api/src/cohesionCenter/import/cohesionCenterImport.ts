import { BasicRoute, ClasseType, CohesionCenterType, ReferentDto, RouteResponseBody } from "snu-lib";

export interface CohesionCenterImportRoute extends BasicRoute {
  cohesionCenterFilePath: string;
}

export interface ImportCohesionCenterRoute extends BasicRoute {
  method: "POST";
  path: "";
  payload: CohesionCenterImportRoute;
  response: RouteResponseBody<ClasseType>;
}

export interface CohesionCenterCSV {
  "Matricule du Centre": string;
  "Désignation du centre": string;
  Adresse: string;
  "Complément adresse": string;
  "Code postal": string;
  Commune: string;
  "Commentaire interne sur l'enregistrement": string;
  "Capacité d'accueil Maximale": string;
  "Acceuil PMR": string;
  "Avis conforme": string;
  "Date avis commission hygiène & sécurité": string;
  "Région académique": string;
  Académie: string;
  Département: string;
  "Typologie du centre": string;
  "Domaine d'activité": string;
  "Organisme de rattachement": string;
  "Date début validité de l'enregistrement": string;
  "Date fin de validité de l'enregistrement": string;
  "ID temporaire": string;
}

export type CohesionCenterImportMapped = Pick<
  CohesionCenterType,
  | "name"
  | "address"
  | "city"
  | "zip"
  | "department"
  | "region"
  | "placesTotal"
  | "pmr"
  | "academy"
  | "typology"
  | "domain"
  | "complement"
  | "centerDesignation"
  | "observations"
  | "COR"
  | "code"
  | "code2022"
  | "departmentCode"
  | "matricule"
> & { _id?: string };
