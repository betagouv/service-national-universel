import { capture } from "../../sentry";
import slack from "../../slack";
import { isCohortValidationDateToday, processCohort } from "./service";
import { getSejoursEnCoursDeRealisation } from "./repository";

const title = "Autovalidation de la phase 1";

export const handler = async (date = new Date()): Promise<void> => {
  try {
    const cohortesEnCours = await getSejoursEnCoursDeRealisation(date);
    const cohortesAValider = cohortesEnCours.filter((c) => isCohortValidationDateToday(c, date));
    if (!cohortesAValider.length) {
      slack.info({ title, text: "Aucune cohorte à valider aujourd'hui" });
      return;
    }
    slack.info({ title, text: `Cohortes à valider : ${cohortesAValider.map((cohort) => cohort.name)}` });

    for (const cohort of cohortesAValider) {
      const count = await processCohort(cohort, date);
      if (count === 0) {
        slack.info({ title, text: `Aucun jeune n'a été modifié pour la cohorte ${cohort.name}` });
        return;
      }
      slack.success({ title, text: `${count} jeunes ont été modifiés pour la cohorte ${cohort.name}` });
    }

    slack.info({ title, text: "Autovalidation de la phase 1 terminée" });
  } catch (e) {
    capture(e);
    slack.error({ title: "Erreur lors de l'autovalidation de la phase 1", text: JSON.stringify(e) });
    throw e;
  }
};
