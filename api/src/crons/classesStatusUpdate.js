const config = require("config");
const slack = require("../slack");
const { capture } = require("../sentry");
const { CohortModel, ClasseModel, YoungModel } = require("../models");
const ClasseStateManager = require("../cle/classe/stateManager");

exports.handler = async () => {
  try {
    const resultOpen = [];
    let totalOpen = 0;
    const resultClosed = [];
    let totalClosed = 0;
    //For now this logic (perf wise) is ok but we need to monitor after the first 2025 cohort opening
    const cursor = CohortModel.find({ type: "CLE", inscriptionEndDate: { $gte: new Date() } }).cursor();

    await cursor.addCursorFlag("noCursorTimeout", true).eachAsync(async (cohort) => {
      // Get inscription date
      const now = new Date();
      const inscriptionStartDate = new Date(cohort.inscriptionStartDate);
      const inscriptionEndDate = new Date(cohort.inscriptionEndDate);
      const isInscriptionOpen = now >= inscriptionStartDate && now <= inscriptionEndDate;
      const isInscriptionClosed = now >= inscriptionEndDate || now <= inscriptionStartDate;

      if (isInscriptionOpen) {
        //we fetch all the classes of the cohort because we need to update them or recompute them (prevent from edge case)
        const classes = await ClasseModel.find({ cohortId: cohort._id.toString() });
        //if some classe are in status CLOSED or ASSIGNED, we need to update them
        const needUpdate = classes.some((c) => ["CLOSED", "ASSIGNED"].includes(c.status));
        if (needUpdate) {
          for (const classe of classes) {
            await ClasseStateManager.compute(classe._id.toString(), {}, { YoungModel });
          }
          resultOpen.push(cohort.name);
          totalOpen += classes.length;
        }
      }

      if (isInscriptionClosed) {
        //we fetch all the classes of the cohort because we need to update them or recompute them (prevent from edge case)
        const classes = await ClasseModel.find({ cohortId: cohort._id.toString() });
        //if some classe are in status OPEN, we need to update them
        const needUpdate = classes.some((c) => c.status === "OPEN");
        if (needUpdate) {
          for (const classe of classes) {
            await ClasseStateManager.compute(classe._id.toString(), {}, { YoungModel });
          }
          resultClosed.push(cohort.name);
          totalClosed += classes.length;
        }
      }
    });

    slack.success({
      title: "ClassesStatusUpdate",
      text: `Open: ${totalOpen} classes updated for cohorts: ${resultOpen.join(", ")}. Closed: ${totalClosed} classes updated for cohorts: ${resultClosed.join(", ")}`,
    });
  } catch (e) {
    capture(e);
    slack.error({ title: "ClassesStatusUpdate", text: JSON.stringify(e) });
    throw e;
  }
};
