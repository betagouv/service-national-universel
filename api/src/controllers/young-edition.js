/**
 * /young-edition
 *
 * ROUTES
 *   PUT   /young-edition/:id/identite
 */

const express = require("express");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const YoungModel = require("../models/young");
const { ERRORS } = require("../utils");
const { capture } = require("../sentry");
const { validateFirstName } = require("../utils/validator");
const { serializeYoung } = require("../utils/serializer");
const passport = require("passport");
const { YOUNG_SITUATIONS, GRADES } = require("snu-lib");

router.put("/:id/identite", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // --- validate data
    const bodySchema = Joi.object().keys({
      firstName: validateFirstName().trim(),
      lastName: Joi.string().uppercase(),
      gender: Joi.string().valid("male", "female"),
      email: Joi.string().lowercase().trim(),
      phone: Joi.string().trim(),
      latestCNIFileExpirationDate: Joi.date(),
      birthdateAt: Joi.date(),
      birthCity: Joi.string().trim(),
      birthCityZip: Joi.string().trim(),
      birthCountry: Joi.string().trim(),
      address: Joi.string().trim(),
      zip: Joi.string().trim(),
      city: Joi.string().trim(),
      country: Joi.string().trim().allow(""),
      foreignAddress: Joi.string().trim().allow(""),
      foreignZip: Joi.string().trim().allow(""),
      foreignCity: Joi.string().trim().allow(""),
      foreignCountry: Joi.string().trim().allow(""),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      console.log("joi error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- update young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    console.log("SAVE VALUE: ", value);
    console.log("body: ", req.body);

    young.set(value);
    await young.save({ fromUser: req.user });

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/situationparents", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // --- validate data
    const bodySchema = Joi.object().keys({
      situation: Joi.string().valid(...Object.keys(YOUNG_SITUATIONS)),
      schoolCity: Joi.string().trim().allow(""),
      schoolName: Joi.string().trim().allow(""),
      grade: Joi.string().valid(...Object.keys(GRADES)),

      parent1Status: Joi.string().trim().allow(""),
      parent1LastName: Joi.string().trim().allow(""),
      parent1FirstName: Joi.string().trim().allow(""),
      parent1Email: Joi.string().trim().allow(""),
      parent1Phone: Joi.string().trim().allow(""),
      parent1OwnAddress: Joi.string().trim().valid("true", "false").allow(""),
      parent1Address: Joi.string().trim().allow(""),
      parent1Zip: Joi.string().trim().allow(""),
      parent1City: Joi.string().trim().allow(""),
      parent1Country: Joi.string().trim().allow(""),

      parent2Status: Joi.string().trim().allow(""),
      parent2LastName: Joi.string().trim().allow(""),
      parent2FirstName: Joi.string().trim().allow(""),
      parent2Email: Joi.string().trim().allow(""),
      parent2Phone: Joi.string().trim().allow(""),
      parent2OwnAddress: Joi.string().trim().valid("true", "false").allow(""),
      parent2Address: Joi.string().trim().allow(""),
      parent2Zip: Joi.string().trim().allow(""),
      parent2City: Joi.string().trim().allow(""),
      parent2Country: Joi.string().trim().allow(""),

      qpv: Joi.string().trim().valid("true", "false").allow("", null),
      handicap: Joi.string().trim().valid("true", "false").allow("", null),
      ppsBeneficiary: Joi.string().trim().valid("true", "false").allow("", null),
      paiBeneficiary: Joi.string().trim().valid("true", "false").allow("", null),
      specificAmenagment: Joi.string().trim().valid("true", "false").allow("", null),
      specificAmenagmentType: Joi.string().trim().allow(""),
      reducedMobilityAccess: Joi.string().trim().valid("true", "false").allow("", null),
      handicapInSameDepartment: Joi.string().trim().valid("true", "false").allow("", null),
      allergies: Joi.string().trim().valid("true", "false").allow("", null),
      highSkilledActivity: Joi.string().trim().valid("true", "false").allow("", null),
      highSkilledActivityType: Joi.string().trim().valid("true", "false").allow("", null),
      highSkilledActivityInSameDepartment: Joi.string().trim().valid("true", "false").allow("", null),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      console.log("joi error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- update young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    console.log("SAVE VALUE: ", value);
    console.log("body: ", req.body);

    young.set(value);
    await young.save({ fromUser: req.user });

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
