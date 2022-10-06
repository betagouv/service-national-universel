const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungObject = require("../../models/young");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");

const { ERRORS, STEPS2023 } = require("../../utils");

router.put("/coordinates", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const { error, value } = Joi.object({
      gender: needRequired(Joi.string().trim().valid("female", "male"), isRequired),
      phone: needRequired(Joi.string().trim(), isRequired),
      // @todo validate remaining fields
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { gender, phone } = value;
    young.set({ gender, phone });
    // await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/consentement/:type", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: typeError, value: type } = checkParameter(req.params.type);
    if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const isRequired = type !== "save";

    const { error, value: body } = Joi.object({
      consentment1: needRequired(Joi.boolean(), isRequired),
      consentment2: needRequired(Joi.boolean(), isRequired),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (isRequired && (body.consentment1 === false || body.consentment1 === false)) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const value = { consentment: "true" };
    if (type === "next") value.inscriptionStep2023 = STEPS2023.REPRESENTANTS;

    young.set(value);
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const checkParameter = (parameter) => {
  const keys = ["next", "save", "correction"];
  return Joi.string()
    .valid(...keys)
    .validate(parameter, { stripUnknown: true });
};

const needRequired = (joi, isRequired) => {
  if (isRequired) return joi.required();
  else return joi.allow(null, "");
};

module.exports = router;
