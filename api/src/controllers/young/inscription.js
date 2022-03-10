const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungObject = require("../../models/young");
const { canUpdateYoungStatus } = require("snu-lib");
const { capture } = require("../../sentry");
const { validateFirstName } = require("../../utils/validator");

const { ERRORS, YOUNG_SITUATIONS, STEPS, inscriptionCheck, YOUNG_STATUS } = require("../../utils");
const { getCohortSessionsAvailability } = require("../../utils/cohort");

router.put("/profile", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    //TODO : Check adress + date
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      firstName: validateFirstName().trim().required(),
      lastName: Joi.string().uppercase().trim().required(),
      birthdateAt: Joi.string().trim().required(),
      birthCountry: Joi.string().trim().required(),
      birthCity: Joi.string().trim().required(),
      birthCityZip: Joi.string().trim().allow(null, ""),
    }).validate(req.body);

    if (error) {
      if (error.details[0].path.find((e) => e === "email")) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
      return res.status(400).send({ ok: false, code: error.toString() });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { email, firstName, lastName, birthdateAt, birthCountry, birthCity, birthCityZip } = value;
    young.set({ email, firstName, lastName, birthdateAt, birthCountry, birthCity, birthCityZip });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/availability", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessions = await getCohortSessionsAvailability(young);

    const sessionsId = sessions.map((session) => {
      return session.id;
    });

    const { error, value } = Joi.object({
      cohort: Joi.string()
        .trim()
        .required()
        .valid(...sessionsId),
    }).validate(req.body);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    young.set({ inscriptionStep: STEPS.PARTICULIERES, ...value });
    await young.save({ fromUser: req.user });
    await inscriptionCheck(value, young, req);

    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/availability/notEligible", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const sessions = await getCohortSessionsAvailability(young);

    if (sessions?.length === 0 && young.cohort === "2022") {
      young.set({ status: YOUNG_STATUS.NOT_ELIGIBLE });
    } else {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/availability/reset", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    young.set({ cohort: "2022" });
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
