import { getDepartureDate } from "snu-lib";
import { logger } from "../../logger";
import { CohortDocument, LigneBusModel, SessionPhase1Model, YoungDocument } from "../../models";
import { addDays } from "date-fns";
import { updateStatusPhase1 } from "../../utils";
import { getYoungCursorByCohortId } from "./repository";

export async function processCohort(cohort: CohortDocument): Promise<number> {
  logger.info(`Autovalidation de la phase 1 pour la cohorte ${cohort.name} au ${cohort.daysToValidate}e jour après l'arrivée`);
  const cursor = getYoungCursorByCohortId(cohort._id);

  let updateCount = 0;

  await cursor.eachAsync(async (young) => {
    const wasUpdated = await processYoung(young, cohort);
    if (wasUpdated) updateCount++;
  });

  await cursor.close();

  return updateCount;
}

export async function processYoung(young: YoungDocument, cohort: CohortDocument): Promise<boolean> {
  const autoValidationUser = {
    firstName: `[CRON] Autovalidation de la phase 1 au ${cohort.daysToValidate}e jour après l'arrivée`,
  };

  const bus = await LigneBusModel.findById(young.ligneId);
  const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
  const meetingPoint = { bus };
  const dateStart = getDepartureDate(young, sessionPhase1, cohort, meetingPoint);
  logger.info(`Jeune ${young._id} - date d'arrivée : ${dateStart}`);

  const validationDate = addDays(dateStart, cohort.daysToValidate);
  logger.info(`Jeune ${young._id} - date de validation : ${validationDate}`);

  const wasUpdated = await updateStatusPhase1(young, validationDate, autoValidationUser);
  logger.info(`Jeune ${young._id} - statut de la phase 1 mis à jour : ${wasUpdated}`);

  return wasUpdated;
}
