import { addDays, differenceInDays } from "date-fns";
import { updateStatusPhase1 } from "../utils";

import { capture } from "../sentry";
import slack from "../slack";
import { CohortModel, LigneBusModel, SessionPhase1Model, YoungModel } from "../models";
import { getDepartureDate, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { logger } from "../logger";

export const handler = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();

    const cohortsAVenir = ["CLE 23-24", "2025 CLE Globale"];

    const onGoingCohorts = await CohortModel.find({
      $and: [{ dateStart: { $lte: now } }, { dateEnd: { $gte: now } }, { name: { $nin: cohortsAVenir } }],
    });

    if (!onGoingCohorts.length) {
      logger.info("Aucune cohorte en cours");
      slack.info({
        title: "Autovalidation de la phase 1",
        text: "Aucune cohorte en cours",
      });
      return;
    }

    logger.info(`Cohortes en cours : ${onGoingCohorts.map((cohort) => cohort.name)}`);
    slack.info({
      title: "Autovalidation de la phase 1",
      text: `Cohortes en cours : ${onGoingCohorts.map((cohort) => cohort.name)}`,
    });

    for (const cohort of onGoingCohorts) {
      logger.info(`Autovalidation de la phase 1 pour la cohorte ${cohort.name} après ${cohort.daysToValidate} jours après le départ`);
      const cursor = YoungModel.find({ cohortId: cohort._id, status: YOUNG_STATUS.VALIDATED, statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED }).cursor();

      const autoValidationUser = {
        firstName: `[CRON] Autovalidation de la phase 1 après ${cohort.daysToValidate} jours après le départ`,
      };

      let nbYoungs = 0;
      await cursor.eachAsync(async (young) => {
        const bus = await LigneBusModel.findById(young.ligneId);
        const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
        const meetingPoint = { bus };
        const dateStart = getDepartureDate(young, sessionPhase1, cohort, meetingPoint);
        logger.info(`Jeune ${young._id} - date de départ : ${dateStart}`);

        const difference = differenceInDays(now, dateStart);
        const daysToValidate = cohort.daysToValidate;
        logger.info(`Jeune ${young._id} - jours depuis le départ : ${difference} - nb de jours dans les paramètres du séjour : ${daysToValidate}`);
        if (difference !== daysToValidate) {
          logger.info(`Jeune ${young._id} - pas de validation automatique, le nombre de jours ne correspond pas`);
          return;
        }

        logger.info(`Jeune ${young._id} - validation automatique de la phase 1`);
        const validationDateWithDays = addDays(new Date(dateStart), cohort.daysToValidate).toISOString();
        logger.info(`Jeune ${young._id} - date de validation : ${validationDateWithDays}`);
        const modified = await updateStatusPhase1(young, validationDateWithDays, autoValidationUser);
        logger.info(`Jeune ${young._id} - statut de la phase 1 mis à jour : ${modified}`);
        if (modified) nbYoungs++;
      });

      if (nbYoungs > 0) {
        slack.success({
          title: "Autovalidation de la phase 1",
          text: `${nbYoungs} jeunes ont été modifiés pour la cohorte ${cohort.name}`,
        });
      } else {
        slack.info({
          title: "Autovalidation de la phase 1",
          text: `Aucun jeune n'a été modifié pour la cohorte ${cohort.name}`,
        });
      }
    }
  } catch (e) {
    capture(e);
    slack.error({ title: "CheckCoherence", text: JSON.stringify(e) });
    throw e;
  }
};
