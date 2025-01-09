export function sessionPhase1ImportValidator(headers: string[]) {
  const requiredHeaders = ["Code du centre pour la session", "Session formule", "Désignation du centre", "Effectif d'individuels", "Effectif d'élèves (CLE)"];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(missingHeaders.join(", "));
  }
}
