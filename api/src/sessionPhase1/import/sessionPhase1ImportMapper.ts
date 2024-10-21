import { logger } from "../../logger";
import { SessionCohesionCenterCSV, SessionCohesionCenterImportMapped } from "./sessionPhase1Import";

export const mapSessionCohesionCentersForSept2024 = (sessionsCcohesionCenters: SessionCohesionCenterCSV[]): SessionCohesionCenterImportMapped[] => {
  return sessionsCcohesionCenters.map((sessionCohesionCenter) => {
    const sessionCohesionCenterWithoutId: SessionCohesionCenterImportMapped = {
      sessionFormule: sessionCohesionCenter["Session formule"],
      cohesionCenterMatricule: sessionCohesionCenter["Désignation du centre"],
      sessionPlaces: getSessionPlaces(sessionCohesionCenter),
      sejourSnuId: sessionCohesionCenter["Code du centre pour la session"],
    };
    if (sessionCohesionCenter["ID temporaire"]) {
      return { _id: sessionCohesionCenter["ID temporaire"].toLowerCase(), ...sessionCohesionCenterWithoutId };
    }
    return sessionCohesionCenterWithoutId;
  });
};

export const getSessionPlaces = (sessionCohesionCenterCSV: SessionCohesionCenterCSV) => {
  let sessionPlaces = 0;
  if (sessionCohesionCenterCSV["Session formule"].includes("HTS")) {
    sessionPlaces = sessionCohesionCenterCSV["Effectif d'individuels"];
  }
  sessionPlaces = sessionCohesionCenterCSV["Effectif d'élèves (CLE)"];
  if (isNaN(sessionPlaces)) {
    logger.warn(`sessionPlaces is not a number for code : ${sessionCohesionCenterCSV["Code du centre pour la session"]}`);
  }
  return sessionPlaces || 0;
};
