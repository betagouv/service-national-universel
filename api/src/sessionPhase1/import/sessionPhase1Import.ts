import { BasicRoute, ClasseType, RouteResponseBody } from "snu-lib";

export interface sessionCenterFilePath extends BasicRoute {
  sessionCohesionCenterFilePath: string;
}

export interface ImportSessionCohesionCenterRoute extends BasicRoute {
  method: "POST";
  path: "";
  payload: sessionCenterFilePath;
  response: RouteResponseBody<ClasseType>;
}

export interface SessionCohesionCenterCSV {
  Matricule: string;
  Désignation: string;
  "Capacité d'accueil Maximale": number;
  "Effets individuels": number;
  "Code du centre pour la session": string;
}

export type SessionCohesionCenterImportMapped = {
  sessionFormule: string;
  cohesionCenterMatricule: string;
  sessionPlaces: number;
  modaliteSnuId: string;
};
