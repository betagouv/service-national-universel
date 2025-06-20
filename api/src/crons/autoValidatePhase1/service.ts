import { logger } from "../../logger";
import { CohortDocument } from "../../models";
import { getCursorPourJeunesAValiderByCohortId } from "./repository";
import { updateStatusPhase1 } from "../../sessionPhase1/validation/sessionPhase1ValidationService";
import { UserDto, YOUNG_STATUS_PHASE1 } from "snu-lib";

export async function processCohort(cohort: CohortDocument, dateValidation: Date, user: Partial<UserDto>): Promise<number> {
  logger.info(`Autovalidation de la phase 1 pour la cohorte ${cohort.name} au ${cohort.daysToValidate}e jour après l'arrivée`);
  const cursor = getCursorPourJeunesAValiderByCohortId(cohort._id);
  let count = 0;
  await cursor.eachAsync(async (young) => {
    try {
      if (young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE) {
        logger.info(`processCohort - Le volontaire ${young._id} est déjà validé pour la phase 1, pas de modification`);
        return;
      }
      await updateStatusPhase1(young, dateValidation, user);
      count++;
    } catch (error) {
      logger.error(`Erreur lors de la validation automatique de la phase 1 pour le volontaire ${young._id} : ${error.message}`);
    }
  });
  await cursor.close();
  return count;
}
