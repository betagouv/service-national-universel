const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");
const { ERRORS } = require("../utils");

router.get("/availability/2022", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  const young = req.user;
  let sessions = [
    {
      month: "Février",
      excludedGrade: ["3eme", "1ere", "Terminale", "Terminale CAP"],
      // exclude all DOM-TOMs
      excludedZip: ["971", "972", "973", "974", "975", "976", "978", "984", "986", "987", "988"],
      includedBirthdate: { begin: "2004-02-26", end: "2007-02-12" },
      stringDate: "13 au 25 février 2022",
      info: "Pour les élèves de 2nde scolarisés dans un établissement relevant du ministère de l’éducation nationale, de la jeunesse et des sports, l’inscription est possible y compris dans le cas où une semaine du séjour de cohésion se déroule sur le temps scolaire. Ils bénéficieront d’une autorisation de participation au séjour de cohésion.",
      buffer: 1.15,
      id: "Février 2022",
    },
    {
      month: "Juin",
      excludedGrade: ["3eme", "1ere", "Terminale", "Terminale CAP"],
      excludedZip: [],
      includedBirthdate: { begin: "2004-06-25", end: "2007-06-11" },
      stringDate: "12 au 24 juin 2022",
      buffer: 1.25,
      id: "Juin 2022",
    },
    {
      month: "Juillet",
      excludedGrade: [],
      excludedZip: [],
      includedBirthdate: { begin: "2004-07-16", end: "2007-07-02" },
      stringDate: "3 au 15 juillet 2022",
      buffer: 1.25,
      id: "Juillet 2022",
    },
  ].filter((el) => {
    if (el.excludedGrade.includes(young.grade)) return false;
    else if (el.excludedZip.some((e) => new RegExp(`^${e}`).test(young.zip))) return false;
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
      const goal = await InscriptionGoalModel.findOne({ department: young.department, cohort: session.id });
      if (!goal || !goal.max) {
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

      const ratio = Math.floor(goal.max * session.buffer) / nbYoung;
      if (ratio >= 1) session.goalReached = true;
      else session.goalReached = false;
    }

    return res.send({ ok: true, data: sessions });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
