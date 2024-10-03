const { capture } = require("../sentry");
const { YoungModel, InscriptionGoalModel } = require("../models");
const slack = require("../slack");
const { departmentList } = require("./utils");

const arr = departmentList;

// cf: api/src/services/inscription-goal.ts getJeunesValidesCount
// TODO: factoriser le code de calcul des objectifs des départements
const getCount = async ({ department }) => {
  const res = {};
  // scolarisé
  let cursor = await YoungModel.find({ department, schoolDepartment: department, status: { $in: ["VALIDATED"] }, cohort: /2024/ }).cursor();
  await cursor.eachAsync(async function (young) {
    res[young.cohort] = (res[young.cohort] || 0) + 1;
  });
  // non scolarisé
  cursor = await YoungModel.find({ department, schoolDepartment: { $exists: false }, status: { $in: ["VALIDATED"] }, cohort: /2024/ }).cursor();
  await cursor.eachAsync(async function (young) {
    res[young.cohort] = (res[young.cohort] || 0) + 1;
  });
  // HZR
  cursor = await YoungModel.find({ departement: { $ne: department }, schoolDepartment: department, status: { $in: ["VALIDATED"] }, cohort: /2024/ }).cursor();
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
