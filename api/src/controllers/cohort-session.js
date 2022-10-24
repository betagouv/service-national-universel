const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { capture } = require("../sentry");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");
const { ERRORS } = require("../utils");
const { getCohortSessionsAvailability, isGoalReached } = require("../utils/cohort");
const { getDepartmentNumber, getZoneByDepartment, sessions2023 } = require("snu-lib");

router.get("/availability/2022", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  const young = req.user;
  try {
    const sessions = await getCohortSessionsAvailability(young);
    return res.send({ ok: true, data: sessions });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/eligibility/2022", async (req, res) => {
  const eligibilityObject = {
    department: req.body.department,
    birthDate: req.body.birthDate,
    schoolLevel: req.body.schoolLevel,
  };
  const { error, value } = Joi.object({
    department: Joi.string().required(),
    birthDate: Joi.string().required(),
    schoolLevel: Joi.string().allow(null, ""),
  })
    .unknown()
    .validate(eligibilityObject);
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
  const { department, birthDate, schoolLevel } = value;
  const formatBirthDate = birthDate.split("/").reverse();
  const correctBirthDate = "".concat("", formatBirthDate);
  let sessions = [
    {
      month: "Février",
      excludedGrade: ["3eme", "1ere", "Terminale", "Terminale CAP"],
      // exclude all DOM-TOMs
      excludedZip: ["971", "972", "973", "974", "975", "976", "978", "984", "986", "987", "988"],
      includedBirthdate: { begin: "2004-02-26", end: "2007-02-12" },
      stringDate: "13 au 25 février 2022",
      inscriptionLimitDate: "2021-12-31",
      info: "Pour les élèves de 2nde scolarisés dans un établissement relevant du ministère de l’éducation nationale et de la jeunesse, l’inscription est possible y compris dans le cas où une semaine du séjour de cohésion se déroule sur le temps scolaire. Ils bénéficieront d’une autorisation de participation au séjour de cohésion.",
      buffer: 1.15,
      id: "Février 2022",
    },
    {
      month: "Juin",
      excludedGrade: ["3eme", "1ere", "Terminale", "Terminale CAP"],
      excludedZip: [],
      includedBirthdate: { begin: "2004-06-25", end: "2007-06-11" },
      inscriptionLimitDate: "2022-04-25, 00:00:01",
      stringDate: "12 au 24 juin 2022",
      buffer: 1.25,
      id: "Juin 2022",
    },
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
    else if (el.excludedGrade.includes(schoolLevel)) return false;
    else if (el.excludedZip.some((e) => getDepartmentNumber(department) === e)) return false;
    else if (
      new Date(el.includedBirthdate.begin).getTime() <= new Date(correctBirthDate).getTime() &&
      new Date(correctBirthDate).getTime() <= new Date(el.includedBirthdate.end).getTime()
    ) {
      return true;
    }
    return false;
  });

  try {
    for (let session of sessions) {
      const inscriptionGoal = await InscriptionGoalModel.findOne({ department: department, cohort: session.id });
      if (!inscriptionGoal || !inscriptionGoal.max) {
        session.goalReached = false;
        continue;
      }

      const nbYoung = await YoungModel.find({
        department: department,
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

    return res.send({ ok: true, data: sessions });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/eligibility/2023", async (req, res) => {
  try {
    const eligibilityObject = {
      department: req.body.department,
      birthDate: req.body.birthDate,
      schoolLevel: req.body.schoolLevel,
      frenchNationality: req.body.frenchNationality,
    };
    const { error, value } = Joi.object({
      department: Joi.string().allow(null, ""),
      birthDate: Joi.date().required(),
      schoolLevel: Joi.string().allow(null, ""),
      frenchNationality: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate(eligibilityObject);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { department, birthDate, schoolLevel, frenchNationality } = value;
    console.log("🚀 ~ file: cohort-session.js ~ line 137 ~ router.post ~ value", value);

    if (!frenchNationality) return res.send({ ok: true, data: { msg: "Pour participer au SNU, vous devez être de nationalité française." } });

    const zone = getZoneByDepartment(department);

    if (
      birthDate >= sessions2023[4].eligibility.bornBefore ||
      (zone === "C" && birthDate <= sessions2023[0].eligibility.bornAfter) ||
      (zone === "A" && birthDate <= sessions2023[1].eligibility.bornAfter) ||
      (["B", "Corse"].includes(zone) && birthDate <= sessions2023[2].eligibility.bornAfter) ||
      (zone === "Etranger" && ["NOT_SCOLARISE", "2ndeGT", "Autre"].includes(schoolLevel) && birthDate <= sessions2023[3].eligibility.bornAfter) ||
      (zone === "Etranger" && !["NOT_SCOLARISE", "2ndeGT", "Autre"].includes(schoolLevel) && birthDate <= sessions2023[4].eligibility.bornAfter)
    )
      return res.send({ ok: true, data: { msg: "Sont éligibles les volontaires âgés de 15 à 17 ans au moment du SNU." } });

    let sessionsFiltered = sessions2023.filter(
      (session) =>
        session.eligibility.zones.includes(zone) &&
        session.eligibility.schoolLevels.includes(schoolLevel) &&
        session.eligibility.bornAfter < birthDate &&
        session.eligibility.bornBefore > birthDate,
    );
    if (sessionsFiltered.length === 0) return res.send({ ok: true, data: { msg: "Aucune session correspondant à vos critères n'a pu être trouvée." } });

    // Check inscription goals
    for (let session of sessionsFiltered) {
      if (isGoalReached(department, session.name) === true) session.goalReached = true;
      else session.goalReached = false;
    }
    console.log(sessionsFiltered);
    return res.send({ ok: true, data: sessionsFiltered });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
