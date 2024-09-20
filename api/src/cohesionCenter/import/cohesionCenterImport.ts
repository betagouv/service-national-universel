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
  Matricule: string;
  Désignation: string;
  Adresse: string;
  Complément: string;
  CP: string;
  Commune: string;
  "Commentaire interne": string;
  Capacité: string;
  PMR: string;
  CHS: string;
  Date: string;
  "Région académique": string;
  Académie: string;
  Département: string;
  "Typologie du centre": string;
  "Domaine d'activité": string;
  "Organisme de rattachement": string;
  Début: string;
  Fin: string;
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
