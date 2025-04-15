import { logger } from "../../logger";
import { CohortDocument, YoungDocument } from "../../models";
import { addDays, isSameDay } from "date-fns";
import { getDateDebutSejour, updateStatusPhase1 } from "../../utils";
import { getYoungCursorByCohortId } from "./repository";

const user = { firstName: "[CRON] Autovalidation de la phase 1" };

export async function processCohort(cohort: CohortDocument, date: Date): Promise<number> {
  logger.info(`Autovalidation de la phase 1 pour la cohorte ${cohort.name} au ${cohort.daysToValidate}e jour après l'arrivée`);
  const cursor = getYoungCursorByCohortId(cohort._id);
  let updateCount = 0;
  await cursor.eachAsync(async (young) => {
    const wasUpdated = await processYoung(young, cohort, date);
    if (wasUpdated) updateCount++;
  });
  await cursor.close();
  return updateCount;
}

export async function processYoung(young: YoungDocument, cohort: CohortDocument, date: Date): Promise<boolean> {
  const dateDebut = await getDateDebutSejour(young, cohort);
  const daysToValidate = cohort.daysToValidate || 8;
  const dateValidation = addDays(dateDebut, daysToValidate);
  if (!isSameDay(date, dateValidation)) {
    logger.info(`Jeune ${young._id} - date de validation non atteinte, aucune modification`);
    return false;
  }
  const updatedYoung = await updateStatusPhase1(young, dateValidation, user);
  logger.info(`Jeune ${young._id} - statut de la phase 1 mis à jour : ${updatedYoung.statusPhase1}`);
  return true;
}
