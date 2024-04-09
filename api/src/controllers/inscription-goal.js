const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { canUpdateInscriptionGoals, canViewInscriptionGoals } = require("snu-lib");
const { capture } = require("../sentry");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");
const { ERRORS } = require("../utils");
const { getFillingRate, FILLING_RATE_LIMIT } = require("../services/inscription-goal");

// Update all inscription goals for a cohort
router.post("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // Validate cohort...
    const { error: errorCohort, value } = Joi.object({ cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (errorCohort) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    // ... then body
    const { error, value: inscriptionsGoals } = Joi.array()
      .items({
        department: Joi.string().required(),
        region: Joi.string(),
        max: Joi.number().allow(null),
      })
      .validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canUpdateInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const promises = inscriptionsGoals.map((item) => {
      // 2021 can be empty in database. This could be removed once all data is migrated.
      return InscriptionGoalModel.find({ cohort: value.cohort === "2021" ? ["2021", null] : value.cohort, department: item.department })
        .then((data) => data.set({ ...item, cohort: value.cohort }))
        .then((data) => data.save({ fromUser: req.user }));
    });
    await Promise.all(promises);
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:cohort", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canViewInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // 2021 can be empty in database. This could be removed once all data is migrated.
    const data = await InscriptionGoalModel.find({ cohort: value.cohort === "2021" ? ["2021", null] : value.cohort });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:department/current", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ department: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canViewInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const y2020 = await YoungModel.find({ cohort: "2020", statusPhase1: "WAITING_AFFECTATION", department: value.department }).countDocuments();
    const y2021 = await YoungModel.find({ cohort: "2021", status: "VALIDATED", department: value.department }).countDocuments();
    const yWL = await YoungModel.find({ status: "WAITING_LIST", department: value.department }).countDocuments();
    const data = { registered: y2020 + y2021, waitingList: yWL };
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:cohort/department/:department", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ department: Joi.string().required(), cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canViewInscriptionGoals(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { department, cohort } = value;
    const fillingRate = await getFillingRate(department, cohort);

    return res.status(200).send({ ok: true, data: fillingRate });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:cohort/department/:department/reached", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ department: Joi.string().required(), cohort: Joi.string().required() }).unknown().validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const { department, cohort } = value;
    const fillingRate = await getFillingRate(department, cohort);

    return res.status(200).send({ ok: true, data: fillingRate >= FILLING_RATE_LIMIT });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
