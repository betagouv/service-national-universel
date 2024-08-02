const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const crypto = require("crypto");

const { YoungModel, CohortModel } = require("../../models");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");
const { validateFirstName, validateParents, representantSchema } = require("../../utils/validator");
const { ERRORS, STEPS2023, YOUNG_SITUATIONS } = require("../../utils");
const {
  canUpdateYoungStatus,
  YOUNG_STATUS,
  SENDINBLUE_TEMPLATES,
  isInRuralArea,
  PHONE_ZONES_NAMES_ARR,
  formatPhoneNumberFromPhoneZone,
  getCohortNames,
  isYoungInReinscription,
  isCle,
  REGLEMENT_INTERIEUR_VERSION,
  COHORTS,
} = require("snu-lib");
const { sendTemplate } = require("./../../brevo");
const config = require("config");
const { getQPV, getDensity } = require("../../geo");
const { getFilteredSessions } = require("../../utils/cohort");

const youngSchooledSituationOptions = [
  YOUNG_SITUATIONS.GENERAL_SCHOOL,
  YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
  YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
  YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
  YOUNG_SITUATIONS.APPRENTICESHIP,
];

const youngEmployedSituationOptions = [YOUNG_SITUATIONS.EMPLOYEE, YOUNG_SITUATIONS.INDEPENDANT, YOUNG_SITUATIONS.SELF_EMPLOYED, YOUNG_SITUATIONS.ADAPTED_COMPANY];
const youngUnemployedSituationOptions = [YOUNG_SITUATIONS.POLE_EMPLOI, YOUNG_SITUATIONS.MISSION_LOCALE, YOUNG_SITUATIONS.CAP_EMPLOI, YOUNG_SITUATIONS.NOTHING];

const youngActiveSituationOptions = [...youngEmployedSituationOptions, ...youngUnemployedSituationOptions];

const foreignAddressFields = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];
const moreInformationFields = ["specificAmenagment", "reducedMobilityAccess", "handicapInSameDepartment"];

const getObjectWithEmptyData = (fields, emptyValue = "") => {
  const object = {};
  fields.forEach((field) => {
    object[field] = emptyValue;
  });
  return object;
};

router.put("/eligibilite", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const eligibilityScheme = {
      birthdateAt: Joi.string().trim().required(),
      schooled: Joi.string().trim().required(),
      grade: Joi.string()
        .trim()
        .valid("4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "1ereCAP", "2ndeCAP", "Autre", "NOT_SCOLARISE")
        .required(),
      schoolName: Joi.string().trim(),
      schoolType: Joi.string().trim().allow(null, ""),
      schoolAddress: Joi.string().trim().allow(null, ""),
      schoolZip: Joi.string().trim().allow(null, ""),
      schoolCity: Joi.string().trim().allow(null, ""),
      schoolDepartment: Joi.string().trim().allow(null, ""),
      schoolRegion: Joi.string().trim().allow(null, ""),
      schoolCountry: Joi.string().trim().allow(null, ""),
      schoolId: Joi.string().trim().allow(null, ""),
      zip: Joi.string().trim().allow(null, ""),
    };

    const { error, value } = Joi.object(eligibilityScheme).validate({ ...req.body }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const keyList = Object.keys(eligibilityScheme);

    const update = {
      schoolType: "",
      schoolAddress: "",
      schoolZip: "",
      schoolCity: "",
      schoolDepartment: "",
      schoolRegion: "",
      schoolCountry: "",
      schoolId: "",
      grade: "",
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
      ...validateCorrectionRequest(young, keyList),
    };

    if (!canUpdateYoungStatus({ body: update, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const formatedDate = new Date(update.birthdateAt);
    formatedDate.setUTCHours(11, 0, 0, 0);
    update.birthdateAt = formatedDate;

    young.set(update);

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/noneligible", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ status: YOUNG_STATUS.NOT_ELIGIBLE });

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/coordinates/:type", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: typeError, value: type } = checkParameter(req.params.type);
    if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let coordonneeSchema = {
      gender: Joi.string().trim().valid("female", "male").required(),
      birthCountry: Joi.string().trim().required(),
      birthCity: Joi.string().trim().required(),
      birthCityZip: Joi.string().trim().allow(null, ""),
      livesInFrance: Joi.string().trim().valid("true", "false").required(),
      addressVerified: Joi.string().trim().valid("true", "false").required(),
      coordinatesAccuracyLevel: Joi.string().trim().valid("housenumber", "street", "locality", "municipality").allow(null, ""),
      country: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      location: Joi.object().keys({ lat: Joi.number().required(), lon: Joi.number().required() }).default({ lat: undefined, lon: undefined }).allow({}, null),
      department: Joi.string().trim().required(),
      region: Joi.string().trim().required(),
      cityCode: Joi.string().trim().default("").allow("", null),
      foreignCountry: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      foreignCity: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      foreignZip: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      foreignAddress: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      hostLastName: Joi.alternatives().conditional("livesInFrance", {
        is: "false",
        then: Joi.string().trim().required(),
        otherwise: Joi.isError(new Error()),
      }),
      hostFirstName: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().required().trim(), otherwise: Joi.isError(new Error()) }),
      hostRelationship: Joi.alternatives().conditional("livesInFrance", {
        is: "false",
        then: Joi.string().trim().valid("Parent", "Frere/Soeur", "Grand-parent", "Oncle/Tante", "Ami de la famille", "Autre").required(),
        otherwise: Joi.isError(new Error()),
      }),
      handicap: Joi.string().trim().valid("true", "false").required(),
      ppsBeneficiary: Joi.string().trim().valid("true", "false").required(),
      paiBeneficiary: Joi.string().trim().valid("true", "false").required(),
      allergies: Joi.string().trim().valid("true", "false").required(),
      moreInformation: Joi.string().trim().valid("true", "false").required(),
      specificAmenagment: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().valid("true", "false").required(),
        otherwise: Joi.isError(new Error()),
      }),
      specificAmenagmentType: Joi.alternatives().conditional("specificAmenagment", {
        is: "true",
        then: Joi.string().trim().required(),
        otherwise: Joi.isError(new Error()),
      }),
      reducedMobilityAccess: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().valid("true", "false").required(),
        otherwise: Joi.isError(new Error()),
      }),
      handicapInSameDepartment: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().valid("true", "false").required(),
        otherwise: Joi.isError(new Error()),
      }),
    };

    if (!isCle(young)) {
      coordonneeSchema.situation = Joi.alternatives().conditional("schooled", {
        is: "true",
        then: Joi.string()
          .trim()
          .valid(...youngSchooledSituationOptions)
          .required(),
        otherwise: Joi.string()
          .trim()
          .valid(...youngActiveSituationOptions)
          .required(),
      });
    }

    let { error, value } = Joi.object(coordonneeSchema).validate({ ...req.body, schooled: young.schooled }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (type === "next") {
      if (isYoungInReinscription(young)) {
        value.reinscriptionStep2023 = STEPS2023.CONSENTEMENTS;
      } else {
        value.inscriptionStep2023 = STEPS2023.CONSENTEMENTS;
      }
    }

    if (type === "correction") {
      const keyList = Object.keys(coordonneeSchema);
      value = { ...value, ...validateCorrectionRequest(young, keyList) };
    }

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({
      ...value,
      employed: youngEmployedSituationOptions.includes(value.situation),
      ...(value.livesInFrance === "true" ? getObjectWithEmptyData(foreignAddressFields) : {}),
      moreInformation: undefined,
      ...(value.moreInformation === "false" ? getObjectWithEmptyData(moreInformationFields, "false") : {}),
      ...(value.moreInformation === "false" || value.specificAmenagment === "false" ? { specificAmenagmentType: "" } : {}),
    });

    // Check quartier prioritaires.
    if (value.zip && value.city && value.address) {
      try {
        const qpv = await getQPV(value.zip, value.city, value.address);
        if (qpv === true) young.set({ qpv: "true" });
        else if (qpv === false) value.qpv = "false";
        else value.qpv = undefined;
      } catch (error) {
        // Continue
      }
    }

    // Check zone rurale.
    if (value.cityCode) {
      const populationDensity = await getDensity(value.cityCode);
      young.set({ populationDensity });
      const isRegionRural = isInRuralArea(young);
      if (isRegionRural !== null) young.set({ isRegionRural });
    }

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

    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({
      consentment: "true",
      acceptCGU: "true",
      acceptRI: REGLEMENT_INTERIEUR_VERSION,
    });

    if (isYoungInReinscription(young)) {
      young.set({ reinscriptionStep2023: STEPS2023.REPRESENTANTS });
    } else {
      young.set({ inscriptionStep2023: STEPS2023.REPRESENTANTS });
    }

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/representants/:type", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: typeError, value: type } = checkParameter(req.params.type);
    if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    let { error, value } = validateParents(req.body, true);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    value.parent1Phone = formatPhoneNumberFromPhoneZone(value.parent1Phone, value.parent1PhoneZone);
    value.parent2Phone = formatPhoneNumberFromPhoneZone(value.parent2Phone, value.parent2PhoneZone);

    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!value.parent2) {
      value.parent2Status = "";
      value.parent2FirstName = "";
      value.parent2LastName = "";
      value.parent2Email = "";
      value.parent2Phone = "";
      value.parent2PhoneZone = undefined;
      value.parent2Inscription2023Token = "";
    }

    if (type === "next") {
      if (isYoungInReinscription(young)) {
        value.reinscriptionStep2023 = isCle(young) ? STEPS2023.CONFIRM : STEPS2023.DOCUMENTS;
      } else {
        value.inscriptionStep2023 = isCle(young) ? STEPS2023.CONFIRM : STEPS2023.DOCUMENTS;
      }

      if (!young?.parent1Inscription2023Token) value.parent1Inscription2023Token = crypto.randomBytes(20).toString("hex");
      if (!young?.parent2Inscription2023Token && value.parent2) value.parent2Inscription2023Token = crypto.randomBytes(20).toString("hex");
    }
    if (type === "correction") {
      const keyList = Object.keys(representantSchema(false));
      value = { ...value, ...validateCorrectionRequest(young, keyList) };
    }
    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set(value);
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/confirm", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    let value = { informationAccuracy: "true" };
    if (isYoungInReinscription(young)) {
      value.reinscriptionStep2023 = STEPS2023.WAITING_CONSENT;
    } else {
      value.inscriptionStep2023 = STEPS2023.WAITING_CONSENT;
    }

    if ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.REINSCRIPTION].includes(young.status) && !young?.inscriptionDoneDate) {
      const cohort = await CohortModel.findOne({ name: young.cohort });
      // If latest ID proof has an invalid date, notify parent 1.
      if (young.latestCNIFileExpirationDate < new Date(cohort.dateStart)) {
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
          cta: `${config.APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1?utm_campaign=transactionnel+replegal1+donner+consentement&utm_source=notifauto&utm_medium=mail+605+donner`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });

      await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_CONSENT, {
        emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
        params: {
          cta: config.APP_URL,
          SOURCE: young.source,
        },
      });

      value.inscriptionDoneDate = new Date();
    }

    young.set(value);
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
      cohort: Joi.string()
        .trim()
        .valid(...getCohortNames(true, false, false))
        .required(),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Check inscription goals
    const sessions = await getFilteredSessions(young, req.headers["x-user-timezone"] || null);
    const session = sessions.find(({ name }) => name === value.cohort);
    if (!session) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED }); //|| session.isFull || session.goalReached

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

router.put("/documents/:type", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: typeError, value: type } = checkParameter(req.params.type);
    if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (type === "next") {
      if (young.files.cniFiles.length === 0) {
        return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      const { error, value } = Joi.object({ date: Joi.date().required(), latestCNIFileCategory: Joi.string().trim() }).validate(req.body, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      let CNIFileNotValidOnStart = undefined;
      if (young.cohort !== COHORTS.AVENIR) {
        const cohort = await CohortModel.findOne({ name: young.cohort });
        CNIFileNotValidOnStart = value.date < new Date(cohort.dateStart);
      }
      young.set({ latestCNIFileExpirationDate: value.date, latestCNIFileCategory: value.latestCNIFileCategory, CNIFileNotValidOnStart });
      if (isYoungInReinscription(young)) {
        young.set({ reinscriptionStep2023: STEPS2023.CONFIRM });
      } else {
        young.set({ inscriptionStep2023: STEPS2023.CONFIRM });
      }
    }

    if (type === "correction") {
      const fileSchema = Joi.object({
        latestCNIFileExpirationDate: Joi.date(),
        latestCNIFileCategory: Joi.string().trim(),
      }).or("latestCNIFileExpirationDate", "latestCNIFileCategory");
      const { error, value } = fileSchema.validate(req.body, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      let data = { ...value, ...validateCorrectionRequest(young, ["latestCNIFileExpirationDate", "cniFile", "latestCNIFileCategory"]) };
      if (!canUpdateYoungStatus({ body: data, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      const cohort = await CohortModel.findOne({ name: young.cohort });
      const CNIFileNotValidOnStart = data.latestCNIFileExpirationDate < new Date(cohort.dateStart);
      young.set({ ...data, CNIFileNotValidOnStart });
    }
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/relance", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // If latest ID proof has an invalid date, notify parent 1.
    const cohort = await CohortModel.findOne({ name: young.cohort });
    const notifyExpirationDate = young.latestCNIFileExpirationDate < new Date(cohort.dateStart);
    const needCniRelance = young?.parentStatementOfHonorInvalidId !== "true";
    const needParent1Relance = !["true", "false"].includes(young?.parentAllowSNU);

    if (notifyExpirationDate && needCniRelance) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/cni-invalide?token=${young.parent1Inscription2023Token}&utm_campaign=transactionnel+replegal+ID+perimee&utm_source=notifauto&utm_medium=mail+610+effectuer`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }
    if (needParent1Relance) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1?utm_campaign=transactionnel+replegal1+donner+consentement&utm_source=notifauto&utm_medium=mail+605+donner`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }

    young.set({ inscriptionDoneDate: new Date() });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/done", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (young.reinscriptionStep2023 === "WAITING_CONSENT") {
      young.set({ reinscriptionStep2023: STEPS2023.DONE });
    } else {
      young.set({ inscriptionStep2023: STEPS2023.DONE });
    }
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/goToInscriptionAgain", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoungInReinscription(young)) {
      young.set({ reinscriptionStep2023: STEPS2023.CONFIRM });
    } else {
      young.set({ inscriptionStep2023: STEPS2023.CONFIRM });
    }

    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/profil", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const profilSchema = {
      firstName: validateFirstName().trim().required(),
      lastName: Joi.string().uppercase().trim().required(),
      email: Joi.string().lowercase().trim().email().required(),
      phone: Joi.string().trim().required(),
      phoneZone: Joi.string()
        .trim()
        .valid(...PHONE_ZONES_NAMES_ARR)
        .required(),
      birthdateAt: isCle(young) ? Joi.string().trim().required() : Joi.string().trim(),
      frenchNationality: isCle(young) ? Joi.string().trim().required() : Joi.string().trim(),
    };

    const { error, value } = Joi.object(profilSchema).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const keyList = Object.keys(profilSchema);
    let data = { ...value, ...validateCorrectionRequest(young, keyList) };

    if (!canUpdateYoungStatus({ body: data, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set(data);
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const validateCorrectionRequest = (young, keyList) => {
  const result = {};
  result.correctionRequests = young.correctionRequests?.map((cr) => {
    if (keyList.includes(cr.field)) {
      cr.status = "CORRECTED";
      cr.correctedAt = new Date();
    }
    return cr;
  });
  const updateStatus = result.correctionRequests?.every((cr) => cr.status === "CORRECTED");
  if (updateStatus) result.status = YOUNG_STATUS.WAITING_VALIDATION;

  return result;
};

const checkParameter = (parameter) => {
  const keys = ["next", "correction"];
  return Joi.string()
    .valid(...keys)
    .validate(parameter, { stripUnknown: true });
};

module.exports = router;
