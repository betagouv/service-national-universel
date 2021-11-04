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
      excludedGrade: ["3eme", "Terminale"],
      excludedZip: ["975", "974", "976", "984", "987", "986", "988"],
      includedBirthdate: { begin: "02/25/2004", end: "02/14/2007" },
      stringDate: "13 au 25 février 2022",
      info: "Vous bénéficierez d'une autorisation d'absence de votre établissement scolaire pour la semaine de cours à laquelle vous n'assisteriez pas, si vous êtes scolarisé(e) en zone B ou C.",
      buffer: 1.15,
      id: "Février 2022",
    },
    {
      month: "Juin",
      excludedGrade: ["3eme", "1ere", "Terminale"],
      excludedZip: [],
      includedBirthdate: { begin: "06/24/2004", end: "06/13/2007" },
      stringDate: "12 au 24 juin 2022",
      info: "Veuillez vous assurer d'être disponible sur l'ensemble de la période.",
      buffer: 1.25,
      id: "Juin 2022",
    },
    {
      month: "Juillet",
      excludedGrade: [],
      excludedZip: [],
      includedBirthdate: { begin: "07/15/2004", end: "07/04/2007" },
      stringDate: "3 au 15 juillet 2022",
      info: "Veuillez vous assurer d'être disponible sur l'ensemble de la période.",
      buffer: 1.25,
      id: "Juillet 2022",
    },
  ].filter((el) => {
    if (el.excludedGrade.includes(young.grade)) return false;
    else if (el.excludedZip.some((e) => new RegExp(`^${young.zip}`).test(e))) return false;
    else if (
      new Date(el.includedBirthdate.begin).getTime() <= new Date(young.birthdateAt).getTime() &&
      new Date(young.birthdateAt).getTime() <= new Date(el.includedBirthdate.end).getTime()
    ) {
      return true;
    }
    return false;
  });

  try {
    for (session of sessions) {
      const goal = await InscriptionGoalModel.findOne({ department: young.department, cohort: session.id });
      if (!goal || !goal.max) {
        session.goalReached = false;
        continue;
      }

      const nbYoung = await YoungModel.find({
        department: young.department,
        cohort: session.id,
        status: { $nin: ["REFUSED", "IN_PROGRESS", "WITHDRAWN", "DELETED"] },
      }).count();
      if (nbYoung === 0) {
        session.goalReached = false;
        continue;
      }

      const ratio = Math.floor(data.max * session.buffer) / nbYoung;
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
