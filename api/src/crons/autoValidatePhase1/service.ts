import { logger } from "../../logger";
import { CohortDocument, SessionPhase1Model, YoungDocument } from "../../models";
import { addDays, isSameDay } from "date-fns";
import { getYoungCursorByCohortId } from "./repository";
import { getDepartureDate } from "snu-lib";
import { updateStatusPhase1 } from "../../sessionPhase1/validation/sessionPhase1ValidationService";

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
  const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
  const dateDebut = getDepartureDate(young, sessionPhase1, cohort);
  logger.debug(`Jeune ${young._id} - date de début de séjour : ${dateDebut}`);

  const daysToValidate = cohort.daysToValidate || 8;
  const dateValidation = addDays(dateDebut, daysToValidate);
  logger.debug(`Jeune ${young._id} - date de validation : ${dateValidation}`);

  logger.debug(`Jeune ${young._id} - date actuelle : ${date}`);
  if (!isSameDay(date, dateValidation)) {
    logger.debug(`Jeune ${young._id} - date de validation non atteinte, aucune modification`);
    return false;
  }

  if (!young.cohesionStayPresence) {
    logger.debug(`Jeune ${young._id} - présence au séjour non renseignée, aucune modification`);
    return false;
  }

  logger.debug(`Jeune ${young._id} - date de validation atteinte, mise à jour du statut`);
  const updatedYoung = await updateStatusPhase1(young, dateValidation, user);
  logger.debug(`Jeune ${young._id} - statut de la phase 1 mis à jour : ${updatedYoung.statusPhase1}`);
  return true;
}
