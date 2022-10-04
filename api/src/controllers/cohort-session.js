const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");
const { ERRORS } = require("../utils");
const { getCohortSessionsAvailability } = require("../utils/cohort");
const { getDepartmentNumber, getZoneByDepartment } = require("snu-lib/region-and-departments");

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
    };
    const { error, value } = Joi.object({
      department: Joi.string().required(),
      birthDate: Joi.date().required(),
      schoolLevel: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate(eligibilityObject);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { department, birthDate, schoolLevel } = value;

    if (schoolLevel !== "SECOND") return res.send({ ok: true, data: [] });

    let cohorts = [];
    const zone = getZoneByDepartment(department);
    switch (zone) {
      case "A":
        if (birthDate > new Date("04/22/2005") && birthDate < new Date("04/09/2008")) {
          cohorts.push({
            id: "Avril 2023 - A",
            dates: "du 9 au 21 avril",
          });
        }
        break;
      case "B":
        if (birthDate > new Date("04/28/2005") && birthDate < new Date("04/16/2008")) {
          cohorts.push({
            id: "Avril 2023 - B",
            dates: "du 16 au 28 avril",
          });
        }
        break;
      case "C":
      case "Corse":
        if (birthDate > new Date("02/19/2005") && birthDate < new Date("03/03/2008")) {
          cohorts.push({
            id: "Février 2023 - C",
            dates: "du 19 février au 3 mars",
          });
        }
        break;
      default:
        break;
    }

    if (birthDate > new Date("06/24/2005") && birthDate < new Date("06/11/2008")) {
      cohorts.push({
        id: "Juin 2023",
        dates: "du 11 au 23 juin",
      });
    }

    if (birthDate > new Date("07/13/2005") && birthDate < new Date("07/01/2008")) {
      cohorts.push({
        id: "Juillet 2023",
        dates: "du 1er au 12 juillet",
      });
    }

    return res.send({ ok: true, data: cohorts });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
