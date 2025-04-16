import { capture } from "../../sentry";
import slack from "../../slack";
import { processCohort } from "./service";
import { getSejoursEnCoursDeRealisation } from "./repository";
import { isCohortValidationDateToday } from "./utils";

const title = "Autovalidation de la phase 1";
const user = { firstName: `[CRON] ${title}` };

export const handler = async (date = new Date()): Promise<void> => {
  try {
    const cohortesEnCours = await getSejoursEnCoursDeRealisation(date);
    const cohortesAValider = cohortesEnCours.filter((c) => isCohortValidationDateToday(c, date));
    if (!cohortesAValider.length) {
      slack.info({ title, text: "Aucune cohorte à valider aujourd'hui" });
      return;
    }
    slack.info({ title, text: `Cohortes à valider : ${cohortesAValider.map((cohort) => cohort.name).join(", ")}` });

    for (const cohort of cohortesAValider) {
      const count = await processCohort(cohort, date, user);
      slack.success({ title, text: `${count} jeunes ont été modifiés pour la cohorte ${cohort.name}` });
    }

    slack.info({ title, text: "Autovalidation de la phase 1 terminée" });
  } catch (e) {
    capture(e);
    slack.error({ title: "Erreur lors de l'autovalidation de la phase 1", text: JSON.stringify(e) });
    throw e;
  }
};
