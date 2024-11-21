import { addDays, differenceInDays } from "date-fns";
import { updateStatusPhase1 } from "../utils";

import { capture } from "../sentry";
import slack from "../slack";
import { CohortModel, LigneBusModel, YoungModel } from "../models";
import { getDepartureDate, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

export const handler = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();

    const cohortsAVenir = ["CLE 23-24", "2025 CLE Globale"];

    const onGoingCohorts = await CohortModel.find({
      $and: [{ dateStart: { $lte: now } }, { dateEnd: { $gte: now } }, { name: { $nin: cohortsAVenir } }],
    });

    if (!onGoingCohorts.length) return;

    for (const cohort of onGoingCohorts) {
      const cursor = await YoungModel.find({ cohortId: cohort._id, status: YOUNG_STATUS.VALIDATED, statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED }).cursor();

      let nbYoungs = 0;
      await cursor.eachAsync(async (young) => {
        const bus = await LigneBusModel.findById(young.ligneId);
        const sessionPhase1 = await CohortModel.findById(young.sessionPhase1Id);
        const dateStart = getDepartureDate(young, sessionPhase1, cohort, { bus });

        if (differenceInDays(now, dateStart) !== cohort.daysToValidate) return;

        const validationDateWithDays = addDays(new Date(dateStart), cohort.daysToValidate).toISOString();
        const modified = await updateStatusPhase1(young, validationDateWithDays, {
          firstName: `[CRON] Autovalidation de la phase 1 après ${cohort.daysToValidate} jours après le départ`,
        });
        if (modified) nbYoungs++;
      });

      if (nbYoungs > 0) {
        slack.success({
          title: "Autovalidation de la phase 1",
          text: `${nbYoungs} jeunes ont été modifiés pour la cohorte ${cohort.name}`,
        });
      }
    }
  } catch (e) {
    capture(e);
    slack.error({ title: "CheckCoherence", text: JSON.stringify(e) });
    throw e;
  }
};
