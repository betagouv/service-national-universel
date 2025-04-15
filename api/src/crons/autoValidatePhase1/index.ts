import { capture } from "../../sentry";
import slack from "../../slack";
import { processCohort } from "./service";
import { getCurrentCohorts } from "./repository";
import { logger } from "../../logger";

const title = "Autovalidation de la phase 1";

export const handler = async (date = new Date()): Promise<void> => {
  try {
    const cohortesEnCours = await getCurrentCohorts(date);
    if (!cohortesEnCours.length) {
      slack.info({ title, text: "Aucune cohorte en cours" });
      logger.info("Aucune cohorte en cours");
      return;
    }
    slack.info({ title, text: `Cohortes en cours : ${cohortesEnCours.map((cohort) => cohort.name)}` });
    logger.info(`Cohortes en cours : ${cohortesEnCours.map((cohort) => cohort.name)}`);

    for (const cohort of cohortesEnCours) {
      const count = await processCohort(cohort, date);
      if (count === 0) {
        slack.info({ title, text: `Aucun jeune n'a été modifié pour la cohorte ${cohort.name}` });
        logger.info(`Aucun jeune n'a été modifié pour la cohorte ${cohort.name}`);
        return;
      }
      slack.success({ title, text: `${count} jeunes ont été modifiés pour la cohorte ${cohort.name}` });
      logger.info(`${count} jeunes ont été modifiés pour la cohorte ${cohort.name}`);
    }

    slack.info({ title, text: "Autovalidation de la phase 1 terminée" });
    logger.info("Autovalidation de la phase 1 terminée");
  } catch (e) {
    capture(e);
    slack.error({ title: "Erreur lors de l'autovalidation de la phase 1", text: JSON.stringify(e) });
    logger.error(`Erreur lors de l'autovalidation de la phase 1: ${JSON.stringify(e)}`);
    throw e;
  }
};
