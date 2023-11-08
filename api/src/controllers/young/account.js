const express = require("express");
const Joi = require("joi");
const passport = require("passport");
const { ERRORS, notifDepartmentChange, YOUNG_STATUS_PHASE1, YOUNG_STATUS } = require("../../utils");
const { getQPV, getDensity } = require("../../geo");
const router = express.Router({ mergeParams: true });
const YoungObject = require("../../models/young");
const CohortObject = require("../../models/cohort");
const { serializeYoung } = require("../../utils/serializer");
const { getFilteredSessions } = require("../../utils/cohort");
const { capture } = require("../../sentry");
const { formatPhoneNumberFromPhoneZone, isPhoneNumberWellFormated, SENDINBLUE_TEMPLATES } = require("snu-lib");
const validator = require("validator");
const { validateParents } = require("../../utils/validator");
const { getFillingRate, FILLING_RATE_LIMIT } = require("../../services/inscription-goal");

router.put("/profile", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = Joi.object({
      gender: Joi.string().valid("male", "female").required(),
      phone: Joi.string().required(),
      phoneZone: Joi.string().required(),
    }).validate(req.body, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isPhoneNumberWellFormated(value.phone, value.phoneZone)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    value.phone = formatPhoneNumberFromPhoneZone(value.phone, value.phoneZone);

    young.set(value);
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Regles de modification d’adresse :
// 1, Lorsque je suis affectée et jusqu’au jour de retour de séjour je ne peux pas modifier mon adresse.
// 2, En cas de changement de département mon eligibilité doit être vérifiée si
//    - mon statut d’inscription est “validée sur liste principale” OU “validée sur liste complémentaire” ET
//    - mon statut phase 1 “en attente d’affectation”

router.put("/address", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = Joi.object({
      addressVerified: Joi.string().trim().valid("true").required(),
      country: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      location: Joi.object()
        .keys({
          lat: Joi.number().required(),
          lon: Joi.number().required(),
        })
        .default({
          lat: undefined,
          lon: undefined,
        })
        .allow({}, null),
      department: Joi.string().trim().required(),
      region: Joi.string().trim().required(),
      cityCode: Joi.string().trim().default("").allow("", null),
      status: Joi.string().valid("VALIDATED", "WAITING_LIST", "NOT_ELIGIBLE").allow(null),
      cohort: Joi.string().allow(null),
    }).validate(req.body, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error: errorHeaders, value: headers } = Joi.object({
      "user-timezone": Joi.number().required(),
    }).validate(req.headers, {
      stripUnknown: true,
    });

    if (errorHeaders) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const currentCohort = await CohortObject.findOne({ name: young.cohort });

    // If the young is affected and the cohort is not ended address can't be updated.
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && new Date(currentCohort.dateEnd).valueOf() > Date.now()) {
      return res.status(403).send({ ok: false, code: ERRORS.NOT_ALLOWED });
    }

    if (
      // Cohort and status should be checked
      value.department !== young.department &&
      value.cohort !== "à venir" &&
      young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION &&
      (young.status === YOUNG_STATUS.VALIDATED || young.status === YOUNG_STATUS.WAITING_LIST)
    ) {
      // @todo eligibility is based on address, should be based on school address.
      const availableSessions = await getFilteredSessions({ grade: young.grade, birthdateAt: young.birthdateAt, ...value }, headers["user-timezone"] || null);

      const cohort = value.cohort ? value.cohort : young.cohort;
      const status = value.status ? value.status : young.status;
      let isGoalReached = false;

      // Check cohort availability
      const isEligible = availableSessions.find((s) => s.name === cohort);

      if (!isEligible && status !== YOUNG_STATUS.NOT_ELIGIBLE) {
        return res.status(403).send({ ok: false, code: ERRORS.NOT_ALLOWED });
      }

      // Check if cohort goal is reached
      if (isEligible) {
        const fillingRate = await getFillingRate(value.department, cohort);
        isGoalReached = fillingRate >= FILLING_RATE_LIMIT;
      }

      if (isGoalReached && status === YOUNG_STATUS.VALIDATED) {
        return res.status(403).send({ ok: false, code: ERRORS.NOT_ALLOWED });
      }

      // Address should be updated without any other modification.
    } else if ((value.cohort && value.cohort !== young.cohort && value.cohort !== "à venir") || (value.status && value.status !== young.status)) {
      return res.status(403).send({ ok: false, code: ERRORS.NOT_ALLOWED });
    }

    if (young.department && value.department !== young.department) {
      await notifDepartmentChange(value.department, SENDINBLUE_TEMPLATES.young.DEPARTMENT_IN, young, { previousDepartment: young.department });
      await notifDepartmentChange(young.department, SENDINBLUE_TEMPLATES.young.DEPARTMENT_OUT, young, { newDepartment: value.department });
    }

    young.set(value);
    await young.save({ fromUser: req.user });

    // Check quartier prioritaires.
    if (value.zip && value.city && value.address) {
      const qpv = await getQPV(value.zip, value.city, value.address);
      if (qpv === true) young.set({ qpv: "true" });
      else if (qpv === false) young.set({ qpv: "false" });
      else young.set({ qpv: "" });
      await young.save({ fromUser: req.user });
    }

    // Check population density.
    if (value.cityCode) {
      const populationDensity = await getDensity(value.cityCode);
      young.set({ populationDensity });
      await young.save({ fromUser: req.user });
    }

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/parents", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { value, error } = validateParents(req.body, true);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isPhoneNumberWellFormated(value.parent1Phone, value.parent1PhoneZone)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    value.parent1Phone = formatPhoneNumberFromPhoneZone(value.parent1Phone, value.parent1PhoneZone);
    if (value.parent1Email && !validator.isEmail(value.parent1Email)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (value.parent2Phone && !isPhoneNumberWellFormated(value.parent2Phone, value.parent2PhoneZone)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (value.parent2Phone && value.parent2PhoneZone) {
      value.parent2Phone = formatPhoneNumberFromPhoneZone(value.parent2Phone, value.parent2PhoneZone);
    }
    if (value.parent2Email && !validator.isEmail(value.parent2Email)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (value.parent2PhoneZone === "") delete value.parent2PhoneZone;

    young.set(value);
    if (value.parent2PhoneZone === "") delete young.parent2PhoneZone;
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
      mobilityNearRelativeAddress: Joi.string().allow(null, ""),
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
