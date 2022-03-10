const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungObject = require("../../models/young");
const { canUpdateYoungStatus } = require("snu-lib");
const { capture } = require("../../sentry");
const { validateFirstName } = require("../../utils/validator");

const { ERRORS, YOUNG_SITUATIONS, STEPS, inscriptionCheck, YOUNG_STATUS } = require("../../utils");

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

router.put("/particulieres", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    //TODO : Check adress + date
    const { error, value } = Joi.object({
      handicap: Joi.string().trim().required().valid("true", "false"),
      ppsBeneficiary: Joi.string().trim().required().valid("true", "false"),
      paiBeneficiary: Joi.string().trim().required().valid("true", "false"),
      allergies: Joi.string().trim().required().valid("true", "false"),
      highSkilledActivity: Joi.string().trim().required().valid("true", "false"),
      moreInformation: Joi.string().trim().required().valid("true", "false"),

      specificAmenagment: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),
      reducedMobilityAccess: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),
      handicapInSameDepartment: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),

      highSkilledActivityInSameDepartment: Joi.alternatives().conditional("highSkilledActivity", {
        is: "true",
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),
    }).validate(req.body);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (value.moreInformation === "false") {
      value.specificAmenagment = "false";
      value.reducedMobilityAccess = "false";
      value.handicapInSameDepartment = "false";
    }

    if (value.highSkilledActivity === "false") {
      value.highSkilledActivityInSameDepartment = "false";
    }

    value.inscriptionStep = STEPS.REPRESENTANTS;
    delete value.moreInformation;

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set(value);
    await young.save({ fromUser: req.user });

    inscriptionCheck(value, young, req);

    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;
