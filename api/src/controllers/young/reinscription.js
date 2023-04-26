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
const { canUpdateYoungStatus, YOUNG_STATUS, SENDINBLUE_TEMPLATES, START_DATE_SESSION_PHASE1, YOUNG_STATUS_PHASE1 } = require("snu-lib");
const { sendTemplate } = require("../../sendinblue");
const { getFilteredSessions } = require("../../utils/cohort");

router.put("/goToReinscription", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ reinscriptionStep2023: STEPS2023REINSCRIPTION.ELIGIBILITE });
    young.set({ status: YOUNG_STATUS.REINSCRIPTION });
    young.set({
      cohesionCenterId: undefined,
      sessionPhase1Id: undefined,
      meetingPointId: undefined,
      ligneId: undefined,
      deplacementPhase1Autonomous: undefined,
      transportInfoGivenByLocal: undefined,
      cohesionStayPresence: undefined,
      presenceJDM: undefined,
      departInform: undefined,
      departSejourAt: undefined,
      departSejourMotif: undefined,
      departSejourMotifComment: undefined,
      youngPhase1Agreement: "false",
      hasMeetingInformation: undefined,
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      cohesionStayMedicalFileReceived: undefined,
    });
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
      grade: Joi.string().trim().valid("4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre", "NOT_SCOLARISE").required(),
      schoolName: Joi.string().trim().required(),
      schoolType: Joi.string().trim().allow(null, ""),
      schoolAddress: Joi.string().trim().allow(null, ""),
      schoolZip: Joi.string().trim().allow(null, ""),
      schoolCity: Joi.string().trim().allow(null, ""),
      schoolDepartment: Joi.string().trim().allow(null, ""),
      schoolRegion: Joi.string().trim().allow(null, ""),
      schoolCountry: Joi.string().trim().allow(null, ""),
      schoolId: Joi.string().trim().allow(null, ""),
      zip: Joi.string().trim().allow(null, ""),
    }).validate({ ...req.body }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({
      schoolType: "",
      schoolAddress: "",
      schoolZip: "",
      schoolCity: "",
      schoolDepartment: "",
      schoolRegion: "",
      schoolCountry: "",
      schoolId: "",
      zip: "",
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

    const sessions = await getFilteredSessions(young);
    const session = sessions.find(({ name }) => name === value.cohort);
    if (!session) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    if (session.goalReached) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    value.reinscriptionStep2023 = STEPS2023REINSCRIPTION.DOCUMENTS;

    let template = SENDINBLUE_TEMPLATES.parent.PARENT_YOUNG_COHORT_CHANGE;
    const emailsTo = [];
    if (young.parent1AllowSNU === "true") emailsTo.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
    if (young?.parent2AllowSNU === "true") emailsTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
    if (emailsTo.length !== 0) {
      await sendTemplate(template, {
        emailTo: emailsTo,
        params: {
          cohort: value.cohort,
          youngFirstName: young.firstName,
          youngName: young.lastName,
          cta: `${config.APP_URL}/change-cohort`,
        },
      });
    }
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

    if (!young?.parent1Inscription2023Token) young.parent1Inscription2023Token = crypto.randomBytes(20).toString("hex");
    if (!young?.parent2Inscription2023Token && young?.parent2Email) young.parent2Inscription2023Token = crypto.randomBytes(20).toString("hex");
    // If latest ID proof has an invalid date, notify parent 1.
    if (young.latestCNIFileExpirationDate < START_DATE_SESSION_PHASE1[young.cohort]) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/cni-invalide?token=${young.parent1Inscription2023Token}&utm_campaign=transactionnel+replegal+ID+perimee&utm_source=notifauto&utm_medium=mail+610+effectuer`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }

    await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
      emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
      params: {
        cta: `${config.APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1%?utm_campaign=transactionnel+replegal1+donner+consentement&utm_source=notifauto&utm_medium=mail+605+donner`,
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
