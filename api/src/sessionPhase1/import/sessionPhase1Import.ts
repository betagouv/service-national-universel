import { BasicRoute, ClasseType, RouteResponseBody } from "snu-lib";

export interface SessionCenterImportRoute extends BasicRoute {
  sessionCenterFilePath: string;
}

export interface ImportSessionCohesionCenterRoute extends BasicRoute {
  method: "POST";
  path: "";
  payload: SessionCenterImportRoute;
  response: RouteResponseBody<ClasseType>;
}

export interface SessionCohesionCenterCSV {
  Matricule: string;
  "Désignation du centre": string;
  "Capacité d'accueil Maximale": number;
  "Effets individuels": number;
  "Effectif d'élèves (CLE)": number;
  "Code du centre pour la session": string;
  "Session formule": string;
}

export type SessionCohesionCenterImportMapped = {
  sessionFormule: string;
  cohesionCenterMatricule: string;
  sessionPlaces: number;
  modaliteSnuId: string;
};
