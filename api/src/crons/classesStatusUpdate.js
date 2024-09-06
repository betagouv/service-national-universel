// const config = require("../../config");
const slack = require("../slack");
const { capture } = require("../sentry");
const { CohortModel, ClasseModel, YoungModel } = require("../models");
const ClasseStateManager = require("../cle/classe/stateManager").default;

exports.handler = async () => {
  try {
    const resultOpen = [];
    let totalOpen = 0;
    const resultClosed = [];
    let totalClosed = 0;

    //For now this logic (perf wise) is ok but we need to monitor after the first 2025 cohort opening
    const cursor = CohortModel.find({ type: "CLE" }).cursor(); //dateStart: { $gte: new Date() }

    await cursor.addCursorFlag("noCursorTimeout", true).eachAsync(async (cohort) => {
      // Get inscription date
      const now = new Date();
      const inscriptionStartDate = new Date(cohort.inscriptionStartDate);
      const inscriptionEndDate = new Date(cohort.inscriptionEndDate);
      const isInscriptionOpen = now >= inscriptionStartDate && now <= inscriptionEndDate;
      const isInscriptionClosed = now >= inscriptionEndDate || now <= inscriptionStartDate;

      if (isInscriptionOpen) {
        const { result, total } = await updatesClassesStatus({
          statusList: ["CLOSED", "ASSIGNED"],
          cohort,
          fromUser: { firstName: "Ouverture automatique des inscriptions " + cohort.name },
        });
        resultOpen.push(...result);
        totalOpen = total;
      }

      if (isInscriptionClosed) {
        const { result, total } = await updatesClassesStatus({
          statusList: ["OPEN"],
          cohort,
          fromUser: { firstName: "Fermeture automatique des inscriptions " + cohort.name },
        });
        resultClosed.push(...result);
        totalClosed = total;
      }
    });

    await slack.success({
      title: "ClassesStatusUpdate",
      text: `Open: ${totalOpen} classes updated for cohorts: ${resultOpen.join(", ")}. Closed: ${totalClosed} classes updated for cohorts: ${resultClosed.join(", ")}`,
    });
  } catch (e) {
    capture(e);
    slack.error({ title: "ClassesStatusUpdate", text: JSON.stringify(e) });
    throw e;
  }
};

const updatesClassesStatus = async ({ statusList, cohort, fromUser }) => {
  const result = [];
  let total = 0;
  //we fetch all the classes of the cohort because we need to update them or recompute them (prevent from edge case)
  const classes = await ClasseModel.find({ cohortId: cohort._id.toString(), status: { $ne: "WITHDRAWN" } }).select({ status: 1 });
  //if some classe are in status CLOSED or ASSIGNED, we need to update them
  const needUpdate = classes.some((c) => statusList.includes(c.status));
  if (needUpdate) {
    for (const classe of classes) {
      await ClasseStateManager.compute(classe._id.toString(), fromUser, { YoungModel });
    }
    result.push(cohort.name);
    total += classes.length;

    return { result, total };
  }
};
