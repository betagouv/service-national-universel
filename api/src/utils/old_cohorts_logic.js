import { capture } from "../sentry";

export async function updateStatusPhase1WithSpecificCase(young, validationDate, user) {
  try {
    const now = new Date();
    // Cette constante nous permet de vérifier si un jeune a passé sa date de validation (basé sur son grade)
    const isValidationDatePassed = now >= validationDate;
    // Cette constante nous permet de vérifier si un jeune était présent au début du séjour (exception pour cette cohorte : pas besoin de JDM)(basé sur son grade)
    const isCohesionStayValid = young.cohesionStayPresence === "true";
    // Cette constante nour permet de vérifier si la date de départ d'un jeune permet de valider sa phase 1 (basé sur son grade)
    const isDepartureDateValid = now >= validationDate && (!young?.departSejourAt || young?.departSejourAt > validationDate);

    // On valide la phase 1 si toutes les condition sont réunis. Une exception : le jeune a été exclu.
    if (isValidationDatePassed) {
      if (isValidationDatePassed && isCohesionStayValid && isDepartureDateValid) {
        if (young?.departSejourMotif && ["Exclusion"].includes(young.departSejourMotif)) {
          young.set({ statusPhase1: "NOT_DONE" });
        } else {
          young.set({ statusPhase1: "DONE" });
        }
      } else {
        // Sinon on ne valide pas sa phase 1. Exception : si le jeune a un cas de force majeur ou si urgence sanitaire, on valide sa phase 1
        if (["Cas de force majeure pour le volontaire", "Annulation du séjour ou mesure d’éviction sanitaire"].includes(young?.departSejourMotif)) {
          young.set({ statusPhase1: "DONE" });
        } else if (young?.departSejourMotif && ["Exclusion", "Autre"].includes(young.departSejourMotif)) {
          young.set({ statusPhase1: "NOT_DONE" });
        } else if (young.cohesionStayPresence !== "false") {
          young.set({ statusPhase1: "AFFECTED" });
        } else {
          young.set({ statusPhase1: "NOT_DONE", presenceJDM: "false" });
        }
      }
    }
    await young.save({ fromUser: user });
  } catch (e) {
    capture(e);
  }
}

export async function updateStatusPhase1WithOldRules(young, validationDate, isTerminale, user) {
  try {
    const now = new Date();
    // Cette constante nous permet de vérifier si un jeune a passé sa date de validation (basé sur son grade)
    const isValidationDatePassed = now >= validationDate;
    // Cette constante nous permet de vérifier si un jeune était présent au début du séjour et à la JDM (basé sur son grade)
    const isCohesionStayValid = young.cohesionStayPresence === "true" && (young.presenceJDM === "true" || isTerminale);
    // Cette constante pour permet de vérifier si la date de départ d'un jeune permet de valider sa phase 1 (basé sur son grade)
    const isDepartureDateValid = now >= validationDate && (!young?.departSejourAt || young?.departSejourAt > validationDate);

    // On valide la phase 1 si toutes les condition sont réunis. Une exception : le jeune a été exclu.
    if (isValidationDatePassed) {
      if (isValidationDatePassed && isCohesionStayValid && isDepartureDateValid) {
        if (young?.departSejourMotif && ["Exclusion"].includes(young.departSejourMotif)) {
          young.set({ statusPhase1: "NOT_DONE" });
        } else {
          young.set({ statusPhase1: "DONE" });
        }
      } else {
        // Sinon on ne valide pas sa phase 1. Exception : si le jeune a un cas de force majeur ou si urgence sanitaire, on valide sa phase 1
        if (["Cas de force majeure pour le volontaire", "Annulation du séjour ou mesure d’éviction sanitaire"].includes(young?.departSejourMotif)) {
          young.set({ statusPhase1: "DONE" });
        } else if (young?.departSejourMotif && ["Exclusion", "Autre"].includes(young.departSejourMotif)) {
          young.set({ statusPhase1: "NOT_DONE" });
        } else if (young.cohesionStayPresence === "true" && !young.presenceJDM) {
          young.set({ statusPhase1: "AFFECTED" });
        } else {
          young.set({ statusPhase1: "NOT_DONE", presenceJDM: "false" });
        }
      }
    }
    await young.save({ fromUser: user });
  } catch (e) {
    capture(e);
  }
}
