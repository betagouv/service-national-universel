export interface SessionCohesionCenterCSV {
  Matricule: string;
  "Désignation du centre": string;
  "Capacité d'accueil Maximale": number;
  "Effectif d'individuels": number;
  "Effectif d'élèves (CLE)": number;
  "Code du centre pour la session": string;
  "Session formule": string;
}

export type SessionCohesionCenterImportMapped = {
  sessionFormule: string;
  cohesionCenterMatricule: string;
  cohesionCenterPlacesTotal: number;
  sessionPlaces: number;
  sejourSnuId: string;
  sejourSnuIdRegion?: string;
  codeRegion?: string;
};
