import { addDays, differenceInDays } from "date-fns";
import { updateStatusPhase1 } from "../utils";

import { capture } from "../sentry";
import slack from "../slack";
import { CohortModel, LigneBusModel, YoungModel } from "../models";
import { getDepartureDate } from "snu-lib";

export const handler = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();

    const onGoingCohorts = await CohortModel.find({
      $and: [{ dateStart: { $lte: now } }, { dateEnd: { $gte: now } }],
    });

    if (!onGoingCohorts.length) return;

    for (const cohort of onGoingCohorts) {
      const youngs = await YoungModel.find({ cohortId: cohort._id, status: YOUNG_STATUS.VALIDATED, statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED });

      let nbYoungs = 0;
      for (const young of youngs) {
        const bus = await LigneBusModel.findById(young.ligneId);
        const sessionPhase1 = await CohortModel.findById(young.sessionPhase1Id);
        const dateStart = getDepartureDate(young, sessionPhase1, cohort, { bus });

        let daysToValidate = cohort.daysToValidate;
        if (!daysToValidate) {
          console.warn(`Cohort ${cohort.name} has no daysToValidate`);
          daysToValidate = 8;
        }
        if (differenceInDays(now, dateStart) !== cohort.daysToValidate) continue;

        const validationDateWithDays = addDays(new Date(dateStart), cohort.daysToValidate).toISOString();
        const modified = await updateStatusPhase1(young, validationDateWithDays, {
          firstName: `[CRON] Autovalidation de la phase 1 après ${cohort.daysToValidate} jours après le départ`,
        });
        if (modified) nbYoungs++;
      }

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
