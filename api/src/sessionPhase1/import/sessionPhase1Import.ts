export interface SessionCohesionCenterCSV {
  Matricule: string;
  "Désignation du centre": string;
  "Effectif d'individuels": number;
  "Effectif d'élèves (CLE)": number;
  "Code du centre pour la session": string;
  "Session formule": string;
}

export type SessionCohesionCenterImportMapped = {
  sessionFormule: string;
  cohesionCenterMatricule: string;
  sessionPlaces: number;
  sejourSnuId: string;
};
