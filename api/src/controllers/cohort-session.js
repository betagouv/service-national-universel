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
      excludedGrade: ["3eme", "1ere", "1ere CAP", "Terminale", "Terminale CAP"],
      excludedZip: ["975", "974", "976", "984", "987", "986", "988"],
      includedBirthdate: { begin: "2004-02-26", end: "2007-02-12" },
      stringDate: "13 au 25 février 2022",
      info: "Pour les élèves de 2nde scolarisés dans un établissement relevant du ministère de l’éducation nationale, de la jeunesse et des sports, l’inscription est possible y compris dans le cas où une semaine du séjour de cohésion se déroule sur le temps scolaire. Ils bénéficieront d’une autorisation de participation au séjour de cohésion.",
      buffer: 1.15,
      id: "Février 2022",
    },
    {
      month: "Juin",
      excludedGrade: ["3eme", "1ere", "1ere CAP", "Terminale", "Terminale CAP"],
      excludedZip: [],
      includedBirthdate: { begin: "2004-06-25", end: "2007-06-11" },
      stringDate: "12 au 24 juin 2022",
      info: "Veuillez vous assurer d’être disponible sur l’ensemble de la période. Pourquoi je ne vois pas tous les séjours ? En savoir plus sur l’éligibilité",
      url: "https://support.snu.gouv.fr/help/fr-fr/24-questions-frequemment-posees/181-suis-je-eligible-a-un-sejour-de-cohesion-en-2022",
      buffer: 1.25,
      id: "Juin 2022",
    },
    {
      month: "Juillet",
      excludedGrade: [],
      excludedZip: [],
      includedBirthdate: { begin: "2004-07-16", end: "2007-07-02" },
      stringDate: "3 au 15 juillet 2022",
      info: "Veuillez vous assurer d'être disponible sur l'ensemble de la période.",
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
