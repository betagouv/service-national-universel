const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const crypto = require("crypto");

const YoungObject = require("../../models/young");
const config = require("../../config");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");
const { ERRORS, STEPS2023REINSCRIPTION } = require("../../utils");
const { canUpdateYoungStatus, YOUNG_STATUS, SENDINBLUE_TEMPLATES, START_DATE_SESSION_PHASE1 } = require("snu-lib");
const { sendTemplate } = require("../../sendinblue");

router.put("/goToReinscription", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ reinscriptionStep2023: STEPS2023REINSCRIPTION.ELIGIBILITE });
    young.set({ status: YOUNG_STATUS.REINSCRIPTION });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/eligibilite", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const { error, value } = Joi.object({
      schooled: Joi.string().trim().required(),
      grade: Joi.string().trim().valid("4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre", "NOT_SCOLARISE"),
      schoolName: Joi.string().trim(),
      schoolType: Joi.string().trim(),
      schoolAddress: Joi.string().trim(),
      schoolZip: Joi.string().trim(),
      schoolCity: Joi.string().trim(),
      schoolDepartment: Joi.string().trim(),
      schoolRegion: Joi.string().trim(),
      schoolCountry: Joi.string().trim(),
      schoolId: Joi.string().trim(),
      zip: Joi.string().trim(),
    }).validate({ ...req.body }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({
      ...value,
      ...(value.livesInFrance === "true"
        ? {
            foreignCountry: "",
            foreignAddress: "",
            foreignCity: "",
            foreignZip: "",
            hostFirstName: "",
            hostLastName: "",
            hostRelationship: "",
          }
        : {}),
      reinscriptionStep2023: STEPS2023REINSCRIPTION.SEJOUR,
    });

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/noneligible", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.reinscriptionStep2023 = STEPS2023REINSCRIPTION.NONELIGIBLE;
    young.status = YOUNG_STATUS.NOT_ELIGIBLE;

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/changeCohort", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      originalCohort: Joi.string()
        .trim()
        .valid(
          "Février 2023 - C",
          "Avril 2023 - B",
          "Avril 2023 - A",
          "Juin 2023",
          "Juillet 2023",
          "Juillet 2022",
          "Juin 2022",
          "Février 2022",
          "2022",
          "2021",
          "2020",
          "2019",
          "à venir",
        )
        .required(),
      cohort: Joi.string().trim().valid("Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023", "Juillet 2023").required(),
      cohortChangeReason: Joi.string().trim().required(),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    value.reinscriptionStep2023 = STEPS2023REINSCRIPTION.DOCUMENTS;

    young.set(value);
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/consentement", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      consentment1: Joi.boolean().required().valid(true),
      consentment2: Joi.boolean().required().valid(true),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({
      acceptCGU: "true",
      consentment: "true",
      reinscriptionStep2023: STEPS2023REINSCRIPTION.DOCUMENTS,
    });
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/documents", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const value = { informationAccuracy: "true", reinscriptionStep2023: STEPS2023REINSCRIPTION.WAITING_CONSENT };

    value.parent1Inscription2023Token ||= crypto.randomBytes(20).toString("hex");
    if (value.parent2) value.parent2Inscription2023Token ||= crypto.randomBytes(20).toString("hex");

    // If no ID proof has a valid date, notify parent 1.
    const notifyExpirationDate = young?.files?.cniFiles?.length > 0 && !young?.files?.cniFiles?.some((f) => f.expirationDate > START_DATE_SESSION_PHASE1[young.cohort]);

    if (notifyExpirationDate) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/cni-invalide?token=${value.parent1Inscription2023Token}&utm_campaign=transactionnel+replegal+ID+perimee&utm_source=notifauto&utm_medium=mail+610+effectuer`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }

    await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
      emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
      params: {
        cta: `${config.APP_URL}/representants-legaux/presentation?token=${value.parent1Inscription2023Token}&parent=1%?utm_campaign=transactionnel+replegal1+donner+consentement&utm_source=notifauto&utm_medium=mail+605+donner`,
        youngFirstName: young.firstName,
        youngName: young.lastName,
      },
    });
    value.inscriptionDoneDate = new Date();

    value.reinscriptionStep2023 = STEPS2023REINSCRIPTION.WAITING_CONSENT;

    young.set(value);
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/done", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ reinscriptionStep2023: STEPS2023REINSCRIPTION.DONE });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
