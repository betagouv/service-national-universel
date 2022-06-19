const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");
const { capture } = require("../sentry");

async function getCohortSessionsAvailability(young) {
  let sessions = [
    // {
    //   month: "Juin",
    //   excludedGrade: ["3eme", "1ere", "Terminale", "Terminale CAP"],
    //   excludedZip: [],
    //   includedBirthdate: { begin: "2004-06-25", end: "2007-06-11" },
    //   stringDate: "12 au 24 juin 2022",
    //   buffer: 1.25,
    //   id: "Juin 2022",
    // },
    {
      month: "Juillet",
      excludedGrade: [],
      excludedZip: [],
      includedBirthdate: { begin: "2004-07-16", end: "2007-07-02" },
      inscriptionLimitDate: "2022-06-21, 00:00:01",
      stringDate: "3 au 15 juillet 2022",
      buffer: 1.25,
      id: "Juillet 2022",
    },
  ].filter((el) => {
    if (Date.now() > new Date(el.inscriptionLimitDate).getTime()) return false;
    if (el.excludedGrade.includes(young.grade)) return false;
    else if (
      new Date(el.includedBirthdate.begin).getTime() <= new Date(young.birthdateAt).getTime() &&
      new Date(young.birthdateAt).getTime() <= new Date(el.includedBirthdate.end).getTime()
    ) {
      return true;
    }
    return false;
  });

  try {
    for (let session of sessions) {
      const inscriptionGoal = await InscriptionGoalModel.findOne({ department: young.department, cohort: session.id });
      if (!inscriptionGoal || !inscriptionGoal.max) {
        session.goalReached = false;
        continue;
      }

      const nbYoung = await YoungModel.find({
        department: young.department,
        cohort: session.id,
        status: { $nin: ["REFUSED", "IN_PROGRESS", "NOT_ELIGIBLE", "WITHDRAWN", "DELETED"] },
      }).count();
      if (nbYoung === 0) {
        session.goalReached = false;
        continue;
      }

      const fillingRatio = nbYoung / Math.floor(inscriptionGoal.max * session.buffer);
      if (fillingRatio >= 1) session.goalReached = true;
      else session.goalReached = false;
    }
    return sessions;
  } catch (error) {
    capture(error);
  }
}

module.exports = {
  getCohortSessionsAvailability,
};
