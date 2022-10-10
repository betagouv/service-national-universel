const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungObject = require("../../models/young");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");
const { validateFirstName } = require("../../utils/validator");
const { ERRORS, STEPS2023, YOUNG_SITUATIONS } = require("../../utils");
const { canUpdateYoungStatus } = require("snu-lib");

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

const frenchAddressFields = ["country", "address", "zip", "city", "cityCode", "region", "department", "location", "addressVerified"];
const foreignAddressFields = [
  "foreignCountry",
  "foreignAddress",
  "foreignCity",
  "foreignZip",
  "hostFirstName",
  "hostLastName",
  "hostRelationship",
  "hostCity",
  "hostZip",
  "hostAddress",
  "hostRegion",
  "hostDepartment",
];

const getObjectWithEmptyData = (fields) => {
  const object = {};
  fields.forEach((field) => {
    object[field] = "";
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
      birthCity: needRequired(Joi.string().trim(), isRequired),
      // @todo zip validation? / zip required
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
      country: Joi.alternatives().conditional("livesInFrance", { is: "true", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      city: Joi.alternatives().conditional("livesInFrance", { is: "true", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      zip: Joi.alternatives().conditional("livesInFrance", { is: "true", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      address: Joi.alternatives().conditional("livesInFrance", { is: "true", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      location: Joi.alternatives().conditional("livesInFrance", {
        is: "true",
        then: Joi.object()
          .keys({
            lat: needRequired(Joi.number(), isRequired),
            lon: needRequired(Joi.number(), isRequired),
          })
          .default({
            lat: undefined,
            lon: undefined,
          })
          .allow({}, null),
        otherwise: Joi.isError(new Error()),
      }),
      department: Joi.alternatives().conditional("livesInFrance", { is: "true", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      region: Joi.alternatives().conditional("livesInFrance", { is: "true", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      cityCode: Joi.alternatives().conditional("livesInFrance", { is: "true", then: Joi.string().trim().default("").allow("", null), otherwise: Joi.isError(new Error()) }),
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
      //@todo: add to database hostAddressVerified ?
      hostCity: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      hostZip: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      hostAddress: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      hostRegion: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
      hostDepartment: Joi.alternatives().conditional("livesInFrance", { is: "false", then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
    }).validate({ ...req.body, schooled: young.schooled }, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (type === "next") value.inscriptionStep2023 = STEPS2023.CONSENTEMENTS;

    young.set({
      ...value,
      employed: youngEmployedSituationOptions.includes(value.situation),
      ...(value.livesInFrance === "true" ? getObjectWithEmptyData(foreignAddressFields) : getObjectWithEmptyData(frenchAddressFields)),
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
      parent1Status: needRequired(Joi.string().trim().valid("father", "mother", "other"), isRequired),
      parent1FirstName: needRequired(validateFirstName().trim(), isRequired),
      parent1LastName: needRequired(Joi.string().trim(), isRequired),
      parent1Email: needRequired(Joi.string().lowercase().trim().email(), isRequired),
      parent1Phone: needRequired(Joi.string().trim(), isRequired),
      parent2: needRequired(Joi.string().trim().valid(true, false), isRequired),
      parent2Status: Joi.alternatives().conditional("parent2", { is: true, then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
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
    }

    if (type === "next") value.inscriptionStep2023 = STEPS2023.DOCUMENTS;

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

    young.set({
      informationAccuracy: "true",
      inscriptionStep2023: STEPS2023.WAITING_CONSENT,
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
    console.log(error);

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
