import { SessionCohesionCenterCSV, SessionCohesionCenterImportMapped } from "./sessionPhase1Import";

export const mapSessionCohesionCentersForSept2024 = (sessionsCcohesionCenters: SessionCohesionCenterCSV[]): SessionCohesionCenterImportMapped[] => {
  return sessionsCcohesionCenters.map((sessionCohesionCenter) => {
    const sessionCohesionCenterWithoutId: SessionCohesionCenterImportMapped = {
      sessionFormule: sessionCohesionCenter["Code du centre pour la session"],
      cohesionCenterMatricule: sessionCohesionCenter["Matricule"],
      sessionPlaces: 0, // map
      modaliteSnuId: sessionCohesionCenter["Code du centre pour la session"],
    };
    if (sessionCohesionCenter["ID temporaire"]) {
      return { _id: sessionCohesionCenter["ID temporaire"].toLowerCase(), ...sessionCohesionCenterWithoutId };
    }
    return sessionCohesionCenterWithoutId;
  });
};
