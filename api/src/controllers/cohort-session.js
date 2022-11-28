const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { capture } = require("../sentry");
const { ERRORS } = require("../utils");
const { getAvailableSessions } = require("../utils/cohort");
const { getZoneByDepartment, sessions2023, getDepartmentByZip } = require("snu-lib");
const { validateId } = require("../utils/validator");
const YoungModel = require("../models/young");

// Takes either a young ID in route parameter or young data in request body (for edition or creation pages).
// Minimum data required: birthdateAt, zip and (if schooled) grade.
// Returns an array of session objects filtered by eligibility rules and inscription dates.
// Provides updated numbers of places for the given region for frontend filtering and backend coherence checks.
router.post("/eligibility/2023/:id?", async (req, res) => {
  try {
    let young = {};
    const { value } = validateId(req.params.id);
    if (value) young = await YoungModel.findById(value);
    else {
      const { error: bodyError, value: body } = Joi.object({
        schoolDepartment: Joi.string().allow(null, ""),
        department: Joi.string().allow(null, ""),
        schoolRegion: Joi.string().allow(null, ""),
        region: Joi.string().allow(null, ""),
        birthdateAt: Joi.date().required(),
        grade: Joi.string().allow(null, ""),
        status: Joi.string().allow(null, ""),
        zip: Joi.string().allow(null, ""),
      })
        .unknown()
        .validate(req.body);
      if (bodyError) {
        capture(bodyError);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      young = body;
    }

    // Remove ? (Only used to provide error message.)
    const zone = getZoneByDepartment(young.schoolDepartment || young.department || getDepartmentByZip(young.zip));
    if (
      young.birthdateAt > sessions2023[4].eligibility.bornBefore ||
      (zone === "C" && young.birthdateAt <= sessions2023[0].eligibility.bornAfter) ||
      (zone === "A" && young.birthdateAt <= sessions2023[1].eligibility.bornAfter) ||
      (["B", "Corse"].includes(zone) && young.birthdateAt <= sessions2023[2].eligibility.bornAfter) ||
      (zone === "Etranger" && ["NOT_SCOLARISE", "2ndeGT", "Autre"].includes(young.grade) && young.birthdateAt <= sessions2023[3].eligibility.bornAfter) ||
      (zone === "Etranger" && !["NOT_SCOLARISE", "2ndeGT", "Autre"].includes(young.grade) && young.birthdateAt <= sessions2023[4].eligibility.bornAfter)
    )
      return res.send({ ok: true, data: { msg: "Sont éligibles les volontaires âgés de 15 à 17 ans au moment du SNU." } });

    const sessions = await getAvailableSessions(young);
    if (sessions.length === 0) return res.send({ ok: true, data: { msg: "Aucune session correspondant à vos critères n'a pu être trouvée." } });
    return res.send({ ok: true, data: sessions });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
