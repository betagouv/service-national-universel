const { capture } = require("../sentry");
const Young = require("../models/young");
const inscriptionGoal = require("../models/inscriptionGoal");
const slack = require("../slack");
const { departmentList } = require("./utils");

const arr = departmentList;

const getCount = async ({ department }) => {
  const res = await Young.aggregate([{ $match: { department, status: { $in: ["VALIDATED"] }, cohort: /2024/ } }, { $group: { _id: "$cohort", count: { $sum: 1 } } }]);

  return res.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});
};

const getGoalAndComputeFillingRates = async ({ department, values }) => {
  const goals = await inscriptionGoal.find({ department, cohort: /2024/ });
  await Promise.all(
    goals.map(async (goal) => {
      if (goal.max) {
        const fillingRate = ((values[goal.cohort] || 0) / (goal.max || 0)) * 100;
        goal.set({ fillingRate });
        await goal.save();
      }
    }),
  );
};

exports.handler = async () => {
  try {
    await Promise.all(
      arr.map(async (department) => {
        const values = await getCount({ department });
        await getGoalAndComputeFillingRates({ department, values });
      }),
    );
    await slack.success({ title: "computeGoalsInscription", text: "Le traitement s'est terminé avec succès." });
  } catch (e) {
    capture(e);
    slack.error({ title: "computeGoalsInscription", text: JSON.stringify(e) });
    throw e;
  }
};
