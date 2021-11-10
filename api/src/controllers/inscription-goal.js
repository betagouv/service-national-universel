const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const Joi = require("joi");

const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");
const { ERRORS } = require("../utils");

// Update all inscription goals for a cohort
router.post("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  // Validate cohort...
  const { error: errorCohort, value } = Joi.object({ cohort: Joi.string().required() }).unknown().validate(req.params);
  if (errorCohort) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: errorCohort });
  // ... then body
  const { error, value: inscriptionsGoals } = Joi.array()
    .items({
      department: Joi.string().required(),
      region: Joi.string(),
      max: Joi.number().allow(null),
    })
    .validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });

  try {
    const promises = inscriptionsGoals.map((item) => {
      return InscriptionGoalModel.findOneAndUpdate(
        // 2021 can be empty in database. This could be removed once all data is migrated.
        { cohort: value.cohort === "2021" ? ["2021", null] : value.cohort, department: item.department },
        { ...item, cohort: value.cohort },
        { new: true, upsert: true, useFindAndModify: false }
      );
    });
    await Promise.all(promises);
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required() }).unknown().validate(req.params);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    // 2021 can be empty in database. This could be removed once all data is migrated.
    const data = await InscriptionGoalModel.find({ cohort: value.cohort === "2021" ? ["2021", null] : value.cohort });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:department/current", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  const { error, value } = Joi.object({ department: Joi.string().required() }).unknown().validate(req.params);
  if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
  try {
    const y2020 = await YoungModel.find({ cohort: "2020", statusPhase1: "WAITING_AFFECTATION", department: value.department }).count();
    const y2021 = await YoungModel.find({ cohort: "2021", status: "VALIDATED", department: value.department }).count();
    const yWL = await YoungModel.find({ status: "WAITING_LIST", department: value.department }).count();
    const data = { registered: y2020 + y2021, waitingList: yWL };
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
