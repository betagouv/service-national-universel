import { logger } from "../../logger";
import { CohortDocument, YoungDocument } from "../../models";
import { addDays, isSameDay } from "date-fns";
import { getYoungCursorByCohortId } from "./repository";
import { updateStatusPhase1 } from "../../sessionPhase1/validation/sessionPhase1ValidationService";

const user = { firstName: "[CRON] Autovalidation de la phase 1" };

export function isCohortValidationDateToday(cohort: CohortDocument, date: Date): boolean {
  const dateDebut = cohort.dateStart;
  const daysToValidate = cohort.daysToValidate || 8;
  const dateValidation = addDays(dateDebut, daysToValidate);
  return isSameDay(date, dateValidation);
}

export async function processCohort(cohort: CohortDocument, dateValidation: Date): Promise<number> {
  logger.info(`Autovalidation de la phase 1 pour la cohorte ${cohort.name} au ${cohort.daysToValidate}e jour après l'arrivée`);
  const cursor = getYoungCursorByCohortId(cohort._id);
  let updateCount = 0;
  await cursor.eachAsync(async (young) => {
    await processYoung(young, dateValidation);
    updateCount++;
  });
  await cursor.close();
  return updateCount;
}

export async function processYoung(young: YoungDocument, dateValidation: Date): Promise<YoungDocument> {
  const updatedYoung = await updateStatusPhase1(young, dateValidation, user);
  logger.debug(`Jeune ${young._id} - statut de la phase 1 mis à jour : ${updatedYoung.statusPhase1}`);
  return updatedYoung;
}
