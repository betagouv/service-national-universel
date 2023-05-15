const express = require("express");
const Joi = require("joi");
const passport = require("passport");
const { ERRORS } = require("../../utils");
const router = express.Router({ mergeParams: true });
const YoungObject = require("../../models/young");
const { serializeYoung } = require("../../utils/serializer");
const { capture } = require("../../sentry");

router.put("/profile", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = Joi.object({
      gender: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      phoneZone: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set(value);
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/parents", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = Joi.object({
      parent1Status: Joi.string().required(),
      parent1FirstName: Joi.string().required(),
      parent1LastName: Joi.string().required(),
      parent1Email: Joi.string().email().required(),
      parent1Phone: Joi.string().required(),
      parent1PhoneZone: Joi.string().required(),
      parent2Status: Joi.string().allow(null, ""),
      parent2FirstName: Joi.string().allow(null, ""),
      parent2LastName: Joi.string().allow(null, ""),
      parent2Email: Joi.string().email().allow(null, ""),
      parent2Phone: Joi.string().allow(null, ""),
      parent2PhoneZone: Joi.string().allow(null, ""),
    }).validate(req.body, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set(value);
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/mission-preferences", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = Joi.object({
      domains: Joi.array().items(Joi.string()).required(),
      missionFormat: Joi.string().valid("CONTINUOUS", "DISCONTINUOUS").required(),
      period: Joi.string().valid("WHENEVER", "DURING_HOLIDAYS", "DURING_SCHOOL").required(),
      periodRanking: Joi.array().items(Joi.string()).required(),
      mobilityTransport: Joi.array().items(Joi.string()).required(),
      mobilityTransportOther: Joi.string().allow(null, ""),
      professionnalProject: Joi.string().valid("UNIFORM", "OTHER", "UNKNOWN").required(),
      professionnalProjectPrecision: Joi.string().allow(null, ""),
      desiredLocation: Joi.string().allow(null, ""),
      engaged: Joi.string().valid("true", "false").required(),
      engagedDescription: Joi.string().allow(null, ""),
      mobilityNearHome: Joi.string().valid("true", "false").required(),
      mobilityNearSchool: Joi.string().valid("true", "false").required(),
      mobilityNearRelative: Joi.string().valid("true", "false").required(),
      mobilityNearRelativeName: Joi.string().allow(null, ""),
      mobilityNearRelativAddress: Joi.string().allow(null, ""),
      mobilityNearRelativeZip: Joi.string().allow(null, ""),
      mobilityNearRelativeCity: Joi.string().allow(null, ""),
    }).validate(req.body, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set(value);
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
