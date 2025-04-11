import { capture } from "../../sentry";
import slack from "../../slack";
import { processCohort } from "./service";
import { getCurrentCohorts } from "./repository";

const title = "Autovalidation de la phase 1";

export const handler = async (): Promise<void> => {
  try {
    const cohortesEnCours = await getCurrentCohorts();

    if (!cohortesEnCours.length) {
      slack.info({ title, text: "Aucune cohorte en cours" });
      return;
    }

    slack.info({
      title: "Autovalidation de la phase 1",
      text: `Cohortes en cours : ${cohortesEnCours.map((cohort) => cohort.name)}`,
    });

    for (const cohort of cohortesEnCours) {
      const count = await processCohort(cohort);

      if (count === 0) {
        slack.info({ title, text: `Aucun jeune n'a été modifié pour la cohorte ${cohort.name}` });
        return;
      }
      slack.success({ title, text: `${count} jeunes ont été modifiés pour la cohorte ${cohort.name}` });
    }
  } catch (e) {
    capture(e);
    slack.error({ title: "Erreur lors de l'autovalidation de la phase 1", text: JSON.stringify(e) });
    throw e;
  }
};
