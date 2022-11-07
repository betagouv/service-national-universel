const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const crypto = require("crypto");

const YoungObject = require("../../models/young");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");
const { validateFirstName } = require("../../utils/validator");
const { ERRORS, STEPS2023, YOUNG_SITUATIONS } = require("../../utils");
const { canUpdateYoungStatus, START_DATE_SESSION_PHASE1, YOUNG_STATUS, SENDINBLUE_TEMPLATES, getDepartmentByZip, sessions2023 } = require("snu-lib");
const { sendTemplate } = require("./../../sendinblue");
const config = require("../../config");
const { getQPV, getDensity } = require("../../geo");
const { isGoalReached } = require("../../utils/cohort");
const { isInRuralArea } = require("snu-lib");

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
    const young = await YoungObject.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const eligibilityScheme = {
      birthdateAt: Joi.string().trim().required(),
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
    const young = await YoungObject.findById(req.user._id);
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
  const { error: typeError, value: type } = checkParameter(req.params.type);
  if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

  try {
    const young = await YoungObject.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const isRequired = type !== "save";

    const coordonneeSchema = {
      gender: needRequired(Joi.string().trim().valid("female", "male"), isRequired),
      frenchNationality: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
      birthCountry: needRequired(Joi.string().trim(), isRequired),
      birthCity: needRequired(Joi.string().trim(), isRequired),
      birthCityZip: Joi.string().trim().allow(null, ""),
      phone: needRequired(Joi.string().trim(), isRequired),
      situation: Joi.alternatives().conditional("schooled", {
        is: "true",
        then: needRequired(
          Joi.string()
            .trim()
            .valid(...youngSchooledSituationOptions),
          isRequired,
        ),
        otherwise: needRequired(
          Joi.string()
            .trim()
            .valid(...youngActiveSituationOptions),
          isRequired,
        ),
      }),
      livesInFrance: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
      addressVerified: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
      country: needRequired(Joi.string().trim(), isRequired),
      city: needRequired(Joi.string().trim(), isRequired),
      zip: needRequired(Joi.string().trim(), isRequired),
      address: needRequired(Joi.string().trim(), isRequired),
      location: Joi.object()
        .keys({
          lat: needRequired(Joi.number(), isRequired),
          lon: needRequired(Joi.number(), isRequired),
        })
        .default({
          lat: undefined,
          lon: undefined,
        })
        .allow({}, null),
      department: needRequired(Joi.string().trim(), isRequired),
      region: needRequired(Joi.string().trim(), isRequired),
      cityCode: Joi.string().trim().default("").allow("", null),
      foreignCountry: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      foreignCity: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      foreignZip: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      foreignAddress: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      hostLastName: Joi.alternatives().conditional("livesInFrance", {
        is: "false",
        then: needRequired(Joi.string().trim(), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
      hostFirstName: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      hostRelationship: Joi.alternatives().conditional("livesInFrance", {
        is: "false",
        then: needRequired(Joi.string().trim().valid("Parent", "Frere/Soeur", "Grand-parent", "Oncle/Tante", "Ami de la famille", "Autre"), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
      handicap: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
      ppsBeneficiary: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
      paiBeneficiary: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
      allergies: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
      moreInformation: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
      specificAmenagment: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
      specificAmenagmentType: Joi.alternatives().conditional("specificAmenagment", {
        is: "true",
        then: needRequired(Joi.string().trim(), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
      reducedMobilityAccess: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
      handicapInSameDepartment: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: needRequired(Joi.string().trim().valid("true", "false"), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
    };

    let { error, value } = Joi.object(coordonneeSchema).validate({ ...req.body, schooled: young.schooled }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (type === "next") value.inscriptionStep2023 = STEPS2023.CONSENTEMENTS;

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
      const qpv = await getQPV(value.zip, value.city, value.address);
      if (qpv === true) young.set({ qpv: "true" });
      else if (qpv === false) young.set({ qpv: "false" });
      else young.set({ qpv: "" });
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

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set({
      acceptCGU: "true",
      consentment: "true",
      inscriptionStep2023: STEPS2023.REPRESENTANTS,
    });
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

    const isRequired = type !== "save";

    const representantSchema = {
      parent1Status: needRequired(Joi.string().trim().valid("father", "mother", "representant"), isRequired),
      parent1FirstName: needRequired(validateFirstName().trim(), isRequired),
      parent1LastName: needRequired(Joi.string().trim(), isRequired),
      parent1Email: needRequired(Joi.string().lowercase().trim().email(), isRequired),
      parent1Phone: needRequired(Joi.string().trim(), isRequired),
      parent2: needRequired(Joi.string().trim().valid(true, false), isRequired),
      parent2Status: Joi.alternatives().conditional("parent2", {
        is: true,
        then: needRequired(Joi.string().trim().valid("father", "mother", "representant"), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
      parent2FirstName: Joi.alternatives().conditional("parent2", { is: true, then: needRequired(validateFirstName().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      parent2LastName: Joi.alternatives().conditional("parent2", {
        is: true,
        then: needRequired(Joi.string().uppercase().trim(), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
      parent2Email: Joi.alternatives().conditional("parent2", {
        is: true,
        then: needRequired(Joi.string().lowercase().trim().email(), isRequired),
        otherwise: Joi.isError(new Error()),
      }),
      parent2Phone: Joi.alternatives().conditional("parent2", { is: true, then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
    };

    let { error, value } = Joi.object(representantSchema).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!value.parent2) {
      value.parent2Status = "";
      value.parent2FirstName = "";
      value.parent2LastName = "";
      value.parent2Email = "";
      value.parent2Phone = "";
      value.parent2Inscription2023Token = "";
    }

    if (type === "next") {
      value.inscriptionStep2023 = STEPS2023.DOCUMENTS;
      if (!young?.parent1Inscription2023Token) value.parent1Inscription2023Token = crypto.randomBytes(20).toString("hex");
      if (!young?.parent2Inscription2023Token && value.parent2) value.parent2Inscription2023Token = crypto.randomBytes(20).toString("hex");
    }
    if (type === "correction") {
      const keyList = Object.keys(representantSchema);
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
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const value = { informationAccuracy: "true", inscriptionStep2023: STEPS2023.WAITING_CONSENT };

    if (young.status === "IN_PROGRESS" && !young?.inscriptionDoneDate) {
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
      cohort: Joi.string().trim().valid("Février 2023 - C", "Avril 2023 - B", "Avril 2023 - A", "Juin 2023", "Juillet 2023").required(),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // Check inscription goals
    const dep = young.schoolDepartment || getDepartmentByZip(young.zip);
    const cohort = sessions2023.filter((e) => e.name === young.cohort)[0];
    if (isGoalReached(dep, cohort.name) === true) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

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

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (type === "next") {
      if (young.files.cniFiles.length > 0) {
        young.set("inscriptionStep2023", STEPS2023.CONFIRM);
      } else return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      const { error, value } = Joi.object({ date: Joi.date().required() }).validate(req.body, { stripUnknown: true });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      const CNIFileNotValidOnStart = value.date < START_DATE_SESSION_PHASE1[young.cohort];
      young.set({ latestCNIFileExpirationDate: value.date, CNIFileNotValidOnStart });
    }

    if (type === "correction") {
      const fileSchema = {
        latestCNIFileExpirationDate: Joi.date().required(),
        latestCNIFileCategory: Joi.string().trim().required(),
      };
      const { error, value } = Joi.object(fileSchema).validate(req.body, { stripUnknown: true });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      let data = { ...value, ...validateCorrectionRequest(young, ["latestCNIFileExpirationDate", "cniFile"]) };
      if (!canUpdateYoungStatus({ body: data, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      const CNIFileNotValidOnStart = data.latestCNIFileExpirationDate < START_DATE_SESSION_PHASE1[young.cohort];
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
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // If latest ID proof has an invalid date, notify parent 1.
    const notifyExpirationDate = young.latestCNIFileExpirationDate < START_DATE_SESSION_PHASE1[young.cohort];
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
          cta: `${config.APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1%?utm_campaign=transactionnel+replegal1+donner+consentement&utm_source=notifauto&utm_medium=mail+605+donner`,
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
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ inscriptionStep2023: STEPS2023.DONE });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/goToInscriptionAgain", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ inscriptionStep2023: STEPS2023.CONFIRM });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/profil", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const profilSchema = {
      firstName: validateFirstName().trim().required(),
      lastName: Joi.string().uppercase().trim().required(),
      email: Joi.string().lowercase().trim().email().required(),
    };
    const { error, value } = Joi.object(profilSchema).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

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
  result.correctionRequests = young.correctionRequests.map((cr) => {
    if (keyList.includes(cr.field)) {
      cr.status = "CORRECTED";
      cr.correctedAt = new Date();
    }
    return cr;
  });
  const updateStatus = result.correctionRequests.every((cr) => cr.status === "CORRECTED");
  if (updateStatus) result.status = YOUNG_STATUS.WAITING_VALIDATION;

  return result;
};

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
