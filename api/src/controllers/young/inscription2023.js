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
const { canUpdateYoungStatus, START_DATE_SESSION_PHASE1, SENDINBLUE_TEMPLATES } = require("snu-lib");
const { sendTemplate } = require("./../../sendinblue");
const config = require("../../config");

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

router.put("/coordinates/:type", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  const { error: typeError, value: type } = checkParameter(req.params.type);
  if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

  try {
    const young = await YoungObject.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const isRequired = type !== "save";

    const { error, value } = Joi.object({
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
    }).validate({ ...req.body, schooled: young.schooled }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (type === "next") value.inscriptionStep2023 = STEPS2023.CONSENTEMENTS;

    young.set({
      ...value,
      employed: youngEmployedSituationOptions.includes(value.situation),
      ...(value.livesInFrance === "true" ? getObjectWithEmptyData(foreignAddressFields) : {}),
      moreInformation: undefined,
      ...(value.moreInformation === "false" ? getObjectWithEmptyData(moreInformationFields, "false") : {}),
      ...(value.moreInformation === "false" || value.specificAmenagment === "false" ? { specificAmenagmentType: "" } : {}),
    });

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

    const { error, value } = Joi.object({
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
    }).validate(req.body, { stripUnknown: true });
    console.log(error);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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
      value.parent1Inscription2023Token = crypto.randomBytes(20).toString("hex");
      if (value.parent2) value.parent2Inscription2023Token = crypto.randomBytes(20).toString("hex");
    }

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

    // If ID proof expires before session start, notify parent 1.
    const notifyExpirationDate = young?.files?.cniFiles?.some((f) => f.expirationDate < START_DATE_SESSION_PHASE1[young.cohort]);

    if (notifyExpirationDate) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/cni-invalide?token=${young.parent1Inscription2023Token}`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }

    await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
      emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
      params: {
        cta: `${config.APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1`,
        youngFirstName: young.firstName,
        youngName: young.lastName,
      },
    });

    young.set({
      informationAccuracy: "true",
      inscriptionStep2023: STEPS2023.DONE,
    });
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

    if (type === "next") young.set("inscriptionStep2023", STEPS2023.CONFIRM);
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

    // If ID proof expires before session start, notify parent 1.
    const notifyExpirationDate = young?.files?.cniFiles?.some((f) => f.expirationDate < START_DATE_SESSION_PHASE1[young.cohort]);
    const needCniRelance = young?.parentStatementOfHonorInvalidId !== "true";
    const needParent1Relance = !["true", "false"].includes(young?.parentAllowSNU);
    const needParent2Relance =
      young.parentAllowSNU === "true" && young.parent1AllowImageRights === "true" && young.parent2Email && !["true", "false"].includes(young.parent2AllowImageRights);

    if (notifyExpirationDate && needCniRelance) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/cni-invalide?token=${young.parent1Inscription2023Token}`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }
    if (needParent1Relance) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
        emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/presentation?token=${young.parent1Inscription2023Token}&parent=1`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }

    if (needParent2Relance) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_CONSENT, {
        emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
        params: {
          cta: `${config.APP_URL}/representants-legaux/consentement-parent2?token=${young.parent2Inscription2023Token}`,
          youngFirstName: young.firstName,
          youngName: young.lastName,
        },
      });
    }

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
