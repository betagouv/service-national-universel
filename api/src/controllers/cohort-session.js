const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { capture } = require("../sentry");
const { ERRORS } = require("../utils");
const { isGoalReached, isSessionFull } = require("../utils/cohort");
const { getZoneByDepartment, sessions2023 } = require("snu-lib");

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
        session.eligibility.bornBefore > birthDate &&
        session.eligibility.inscriptionEndDate > Date.now(),
    );
    if (sessionsFiltered.length === 0) return res.send({ ok: true, data: { msg: "Aucune session correspondant à vos critères n'a pu être trouvée." } });

    // Check inscription goals and available places
    for (let session of sessionsFiltered) {
      session.goalReached = await isGoalReached(department, session.name);
      session.isFull = await isSessionFull(department, session.name);
    }
    return res.send({ ok: true, data: sessionsFiltered });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
