import { CohortType } from "snu-lib";
import { isCohortInscriptionClosed, isCohortInscriptionOpen } from "../cohort/cohortService";
import { ClasseModel, CohortModel, YoungModel } from "../models";
import { capture } from "../sentry";
import slack from "../slack";
import ClasseStateManager from "../cle/classe/stateManager";
import { UserSaved } from "../models/types";

export const handler = async () => {
  try {
    const totalOpen = {};
    const totalClosed = {};
    //For now this logic (perf wise) is ok but we need to monitor after the first 2025 cohort opening
    const cursor = CohortModel.find({ type: "CLE", dateStart: { $gte: new Date() } }).cursor();

    await cursor.addCursorFlag("noCursorTimeout", true).eachAsync(async (cohort) => {
      //handle open inscription
      const nbClassesOpen = await handleOpenInscription({ cohort });
      if (nbClassesOpen > 0) totalOpen[cohort.name] = nbClassesOpen;

      //handle closed inscription
      const nbClassesClosed = await handleClosedInscription({ cohort });
      if (nbClassesClosed > 0) totalClosed[cohort.name] = nbClassesClosed;
    });

    await slack.success({
      title: "ClassesStatusUpdate",
      text: `Open : ${JSON.stringify(totalOpen)} - Closed : ${JSON.stringify(totalClosed)}`,
    });
  } catch (e) {
    capture(e);
    slack.error({ title: "ClassesStatusUpdate", text: JSON.stringify(e) });
    throw e;
  }
};

const handleOpenInscription = async ({ cohort }: { cohort: CohortType }): Promise<number> => {
  // Get inscription open date
  const isInscriptionOpen = isCohortInscriptionOpen(cohort);
  if (isInscriptionOpen) {
    const total = await updatesClassesStatus({
      statusList: ["CLOSED", "ASSIGNED"],
      cohort,
      fromUser: { firstName: "Ouverture automatique des inscriptions " + cohort.name },
    });
    return total;
  }
  return 0;
};

const handleClosedInscription = async ({ cohort }: { cohort: CohortType }): Promise<number> => {
  // Get inscription close date
  const isInscriptionClosed = isCohortInscriptionClosed(cohort);
  if (isInscriptionClosed) {
    const total = await updatesClassesStatus({
      statusList: ["OPEN"],
      cohort,
      fromUser: { firstName: "Fermeture automatique des inscriptions " + cohort.name },
    });
    return total;
  }
  return 0;
};

const updatesClassesStatus = async ({ statusList, cohort, fromUser }: { statusList: string[]; cohort: CohortType; fromUser: UserSaved }) => {
  //we fetch all the classes of the cohort because we need to update them or recompute them (prevent from edge case)
  const classes = await ClasseModel.find({ cohortId: cohort._id.toString(), status: { $ne: "WITHDRAWN" } }).select({ status: 1 });
  //if some classe are in status CLOSED or ASSIGNED, we need to update them
  const needUpdate = classes.some((c) => statusList.includes(c.status));
  if (!needUpdate) return 0;

  for (const classe of classes) {
    await ClasseStateManager.compute(classe._id.toString(), fromUser, { YoungModel });
  }
  return classes.length;
};
