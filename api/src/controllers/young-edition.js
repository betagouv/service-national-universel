/**
 * /young-edition
 *
 * ROUTES
 *   PUT   /young-edition/:id/identite
 *   PUT   /young-edition/:id/situationparents
 *   PUT   /young-edition/:id/phasestatus
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
const { YOUNG_SITUATIONS, GRADES, isInRuralArea, canUpdateYoungStatus } = require("snu-lib");
const { getDensity, getQPV } = require("../geo");

const youngEmployedSituationOptions = [YOUNG_SITUATIONS.EMPLOYEE, YOUNG_SITUATIONS.INDEPENDANT, YOUNG_SITUATIONS.SELF_EMPLOYED, YOUNG_SITUATIONS.ADAPTED_COMPANY];
const youngSchooledSituationOptions = [
  YOUNG_SITUATIONS.GENERAL_SCHOOL,
  YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  YOUNG_SITUATIONS.APPRENTICESHIP,
];

router.put("/:id/identite", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) {
      capture(error_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

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
      cityCode: Joi.string().trim().allow(""),
      region: Joi.string().trim().allow(""),
      department: Joi.string().trim().allow(""),
      location: Joi.any(),
      addressVerified: Joi.boolean(),
      foreignAddress: Joi.string().trim().allow(""),
      foreignZip: Joi.string().trim().allow(""),
      foreignCity: Joi.string().trim().allow(""),
      foreignCountry: Joi.string().trim().allow(""),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- update young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    console.log("SAVE VALUE: ", value);
    console.log("body: ", req.body);

    if (value.zip && value.city && value.address) {
      const qpv = await getQPV(value.zip, value.city, value.address);
      if (qpv === true) value.qpv = "true";
      else if (qpv === false) value.qpv = "false";
      else value.qpv = "";
    }

    // Check quartier prioritaires.
    if (value.cityCode) {
      const populationDensity = await getDensity(value.cityCode);
      if (populationDensity) {
        value.populationDensity = populationDensity;
      }
    }
    const isRegionRural = isInRuralArea({ ...young, ...value });
    if (isRegionRural !== null) {
      value.isRegionRural = isRegionRural;
    }

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
    if (error_id) {
      capture(error_id);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // --- validate data
    const bodySchema = Joi.object().keys({
      situation: Joi.string().valid(...Object.keys(YOUNG_SITUATIONS)),
      schoolName: Joi.string().trim().allow(""),
      schoolCity: Joi.string().trim().allow(""),
      schoolCountry: Joi.string().trim().allow(""),
      schoolType: Joi.string().trim().allow(""),
      schoolAddress: Joi.string().trim().allow(""),
      schoolComplementAdresse: Joi.string().trim().allow(""),
      schoolZip: Joi.string().trim().allow(""),
      schoolDepartment: Joi.string().trim().allow(""),
      schoolRegion: Joi.string().trim().allow(""),
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

      // old cohorts
      imageRightFilesStatus: Joi.string().trim().valid("TO_UPLOAD", "WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED"),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      capture(error);
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
    young.set({
      employed: youngEmployedSituationOptions.includes(value.situation) ? "true" : "false",
      schooled: youngSchooledSituationOptions.includes(value.situation) ? "true" : "false",
    });
    await young.save({ fromUser: req.user });

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (err) {
    capture(err);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/phasestatus", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: error_id, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // --- validate data
    const bodySchema = Joi.object().keys({
      statusPhase1: Joi.string().valid("AFFECTED", "WAITING_AFFECTATION", "WAITING_ACCEPTATION", "CANCEL", "EXEMPTED", "DONE", "NOT_DONE", "WITHDRAWN", "WAITING_LIST"),
      statusPhase2: Joi.string().valid("WAITING_REALISATION", "IN_PROGRESS", "VALIDATED", "WITHDRAWN"),
      statusPhase3: Joi.string().valid("WAITING_REALISATION", "WAITING_VALIDATION", "VALIDATED", "WITHDRAWN"),
    });
    const result = bodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      console.log("joi error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- get young
    const young = await YoungModel.findById(id);
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // --- update dates
    const now = new Date();

    if (value.statusPhase2) {
      value.statusPhase2UpdatedAt = now;
      if (value.statusPhase2 === "VALIDATED") {
        value.statusPhase2ValidatedAt = now;
      }
    }

    if (value.statusPhase3) {
      value.statusPhase3UpdatedAt = now;
      if (value.statusPhase3 === "VALIDATED") {
        value.statusPhase3ValidatedAt = now;
      }
    }

    value.lastStatusAt = now;

    // --- check rights
    if (!canUpdateYoungStatus({ body: value, current: young })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- update young
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
