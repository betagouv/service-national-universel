const { capture } = require("../sentry");
const { YoungModel, InscriptionGoalModel } = require("../models");
const slack = require("../slack");
const { departmentList } = require("./utils");

const arr = departmentList;

const getCount = async ({ department }) => {
  const res = {};
  const cursor = await YoungModel.find({ department, status: { $in: ["VALIDATED"] }, cohort: /2024/ }).cursor();
  await cursor.eachAsync(async function (young) {
    res[young.cohort] = (res[young.cohort] || 0) + 1;
  });
  return res;
};
const getGoalAndComputeFillingRates = async ({ department, values }) => {
  if (values && Object.keys(values).length > 0) {
    const cursor = await InscriptionGoalModel.find({ department, cohort: /2024/ }).cursor();
    await cursor.eachAsync(async function (inscriptionGoal) {
      if (inscriptionGoal.max) {
        const fillingRate = ((values[inscriptionGoal.cohort] || 0) / (inscriptionGoal.max || 0)) * 100;
        inscriptionGoal.set({ fillingRate });
        await inscriptionGoal.save();
      }
    });
  }
};

exports.handler = async () => {
  try {
    for (let i = 0; i < arr.length; i++) {
      const department = arr[i];
      const values = await getCount({ department });
      await getGoalAndComputeFillingRates({ department, values });
    }
    await slack.success({ title: "computeGoalsInscription", text: "Le traitement s'est terminé avec succès." });
  } catch (e) {
    capture(e);
    slack.error({ title: "computeGoalsInscription", text: JSON.stringify(e) });
    throw e;
  }
};
