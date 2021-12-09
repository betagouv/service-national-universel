require("dotenv").config({ path: "./../../.env-staging" });
require("../mongo");
const { capture } = require("../sentry");
const Young = require("../models/young");
const inscriptionGoal = require("../models/inscriptionGoal");
const slack = require("../slack");
const { departmentList } = require("./utils");

const arr = departmentList;

const getCount = async ({ department }) => {
  const res = {};
  const cursor = await Young.find({ department, status: { $in: ["VALIDATED"] }, cohort: /2022/ }).cursor();
  await cursor.eachAsync(async function (young) {
    res[young.cohort] = (res[young.cohort] || 0) + 1;
  });
  return res;
};
const getGoalAndComputeFillingRates = async ({ department, values }) => {
  if (values && Object.keys(values).length > 0) {
    const cursor = await inscriptionGoal.find({ department, cohort: /2022/ }).cursor();
    await cursor.eachAsync(async function (inscriptionGoal) {
      if (inscriptionGoal.max) {
        const fillingRate = ((values[inscriptionGoal.cohort] || 0) / (inscriptionGoal.max || 0)) * 100;
        inscriptionGoal.set({ fillingRate });
        // console.log({ department, cohort: inscriptionGoal.cohort, fillingRate });
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
    slack.success({ title: "filling rates computed" });
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
    slack.error({ title: "computeGoalsInscription", text: JSON.stringify(e) });
  }
};
