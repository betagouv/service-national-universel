export const SESSIONS_CENTER_HEADERS = [
  "Session formule",
  "Désignation du centre",
  "Capacité d'accueil Maximale",
  "Effectif d'individuels",
  "Effectif d'élèves (CLE)",
  "Code du centre pour la session",
];

export const checkColumnHeaders = (fileHeaders: string[]) => {
  const missingHeaders = SESSIONS_CENTER_HEADERS.filter((header) => !fileHeaders.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Un fichier d'import de centre doit contenir les colonnes suivantes: ${missingHeaders.join(", ")}`);
  }
};
