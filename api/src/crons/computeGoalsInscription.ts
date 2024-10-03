import { departmentList } from "snu-lib";

import { capture } from "../sentry";
import * as slack from "../slack";

import { YoungModel, InscriptionGoalModel } from "../models";

const getYoungCount = async ({ department }: { department: string }) => {
  const res = {};
  const cursor = await YoungModel.find({ department, status: { $in: ["VALIDATED"] }, cohort: /2024/ }).cursor();
  await cursor.eachAsync(async function (young) {
    const cohort = young.cohort || "";
    res[cohort] = (res[cohort] || 0) + 1;
  });
  return res;
};

const getGoalAndComputeFillingRates = async ({ department, youngCounts }: { department: string; youngCounts: { [key: string]: number } }) => {
  if (youngCounts && Object.keys(youngCounts).length > 0) {
    const cursor = await InscriptionGoalModel.find({ department, cohort: /2024/ }).cursor();
    await cursor.eachAsync(async function (inscriptionGoal) {
      if (inscriptionGoal.max) {
        const fillingRate = ((youngCounts[inscriptionGoal.cohort] || 0) / (inscriptionGoal.max || 0)) * 100;
        inscriptionGoal.set({ fillingRate });
        await inscriptionGoal.save();
      }
    });
  }
};

exports.handler = async () => {
  try {
    for (const department of departmentList) {
      const youngCounts = await getYoungCount({ department });
      await getGoalAndComputeFillingRates({ department, youngCounts });
    }
    await slack.success({ title: "computeGoalsInscription", text: "Le traitement s'est terminé avec succès." });
  } catch (e) {
    capture(e);
    slack.error({ title: "computeGoalsInscription", text: JSON.stringify(e) });
    throw e;
  }
};
