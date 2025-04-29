import express from "express";
import Joi from "joi";
import passport from "passport";
import crypto from "crypto";
import { UserRequest } from "../request";
import { ERRORS, notifDepartmentChange } from "../../utils";
import { getQPV, getDensity } from "../../geo";
import { YoungModel, CohortModel } from "../../models";
import { serializeYoung } from "../../utils/serializer";
import { getFilteredSessions } from "../../utils/cohort";
import { capture } from "../../sentry";
import { formatPhoneNumberFromPhoneZone, isPhoneNumberWellFormated, SENDINBLUE_TEMPLATES, YOUNG_STATUS_PHASE1, YOUNG_STATUS } from "snu-lib";
import validator from "validator";
import { validateParents } from "../../utils/validator";
import { getCompletionObjectifs } from "../../services/inscription-goal";

const router = express.Router({ mergeParams: true });

router.put("/profile", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { value, error } = Joi.object({
      gender: Joi.string().valid("male", "female").required(),
      phone: Joi.string().required(),
      phoneZone: Joi.string().required(),
      psc1Info: Joi.string().valid("true", "false").allow(null),
    }).validate(req.body, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(req.user._id);
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

router.put("/address", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
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
      status: Joi.string().valid("VALIDATED", "WAITING_LIST", "NOT_ELIGIBLE", "WAITING_VALIDATION").allow(null),
      cohort: Joi.string().allow(null),
    }).validate(req.body, { stripUnknown: true });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const currentCohort = await CohortModel.findById(young.cohortId);

    // If the young is affected and the cohort is not ended address can't be updated.
    if (young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && currentCohort && new Date(currentCohort.dateEnd).valueOf() > Date.now()) {
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
      const availableSessions = await getFilteredSessions({ grade: young.grade, birthdateAt: young.birthdateAt, ...value }, Number(req.headers["x-user-timezone"]) || null);

      const cohort = value.cohort ? value.cohort : young.cohort;
      const status = value.status ? value.status : young.status;
      let isGoalReached = false;

      const cohortDocument = await CohortModel.findOne({ name: cohort });
      if (!cohortDocument) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // Check cohort availability
      const isEligible = availableSessions.find((s) => s.name === cohortDocument.name);

      if (!isEligible && status !== YOUNG_STATUS.NOT_ELIGIBLE) {
        return res.status(403).send({ ok: false, code: ERRORS.NOT_ALLOWED });
      }

      // Check if cohort goal is reached
      if (isEligible) {
        const completionObjectif = await getCompletionObjectifs(value.department, cohortDocument);
        isGoalReached = completionObjectif.isAtteint;
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
      else young.set({ qpv: undefined });
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

router.put("/parents", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { value, error } = validateParents(req.body, true);

    if (error) {
      console.log("🚀 ~ router.put ~ error:", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!isPhoneNumberWellFormated(value.parent1Phone, value.parent1PhoneZone)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    value.parent1Phone = formatPhoneNumberFromPhoneZone(value.parent1Phone, value.parent1PhoneZone);
    if (value.parent1Email && !validator.isEmail(value.parent1Email)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (value.parent2) {
      if (value.parent2Phone && !isPhoneNumberWellFormated(value.parent2Phone, value.parent2PhoneZone)) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      if (value.parent2Phone && value.parent2PhoneZone) {
        value.parent2Phone = formatPhoneNumberFromPhoneZone(value.parent2Phone, value.parent2PhoneZone);
      }
      if (value.parent2Email && !validator.isEmail(value.parent2Email)) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      if (value.parent2Email) value.parent2Inscription2023Token = crypto.randomBytes(20).toString("hex");
    } else {
      young.parent2Status = "";
      young.parent2LastName = "";
      young.parent2FirstName = "";
      young.parent2Phone = "";
      // @ts-expect-error nullable field
      young.parent2PhoneZone = null;
      young.parent2Email = "";
      young.parent2Inscription2023Token = "";
    }

    young.set(value);
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/mission-preferences", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
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

    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set(value);
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
