const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");
const crypto = require("crypto");

const YoungObject = require("../../models/young");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");
const { validateFirstName } = require("../../utils/validator");
const { ERRORS, STEPS2023REINSCRIPTION } = require("../../utils");
const { canUpdateYoungStatus, START_DATE_SESSION_PHASE1, SENDINBLUE_TEMPLATES } = require("snu-lib");
const { sendTemplate } = require("../../sendinblue");
const config = require("../../config");

const foreignAddressFields = ["foreignCountry", "foreignAddress", "foreignCity", "foreignZip", "hostFirstName", "hostLastName", "hostRelationship"];

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

    const { error, value } = Joi.object({
      schooled: Joi.string().trim().required(),
      grade: Joi.string().trim().valid("4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"),
      schoolName: Joi.string().trim(),
      schoolType: Joi.string().trim(),
      schoolAddress: Joi.string().trim(),
      schoolZip: Joi.string().trim(),
      schoolCity: Joi.string().trim(),
      schoolDepartment: Joi.string().trim(),
      schoolRegion: Joi.string().trim(),
      schoolCountry: Joi.string().trim(),
      schoolId: Joi.string().trim(),
      sessions: Joi.array().items(Joi.object()),
      zip: Joi.string().trim(),
    }).validate({ ...req.body }, { stripUnknown: true });

    // ! FIXME: Foreign school data

    console.log("🚀 ~ file: reinscription.js ~ line 50 ~ router.put ~ error", value);
    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    value.reinscriptionStep2023 = STEPS2023REINSCRIPTION.SEJOUR;

    young.set({
      ...value,
      ...(value.livesInFrance === "true" ? getObjectWithEmptyData(foreignAddressFields) : {}),
    });

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// router.put("/consentement", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
//   try {
//     const { error, value } = Joi.object({
//       consentment1: Joi.boolean().required().valid(true),
//       consentment2: Joi.boolean().required().valid(true),
//     }).validate(req.body, { stripUnknown: true });

//     if (error) {
//       return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
//     }

//     const young = await YoungObject.findById(req.user._id);
//     if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

//     if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

//     young.set({
//       consentment: "true",
//       inscriptionStep2023: STEPS2023.REPRESENTANTS,
//     });
//     await young.save({ fromUser: req.user });
//     return res.status(200).send({ ok: true, data: serializeYoung(young) });
//   } catch (error) {
//     capture(error);
//     return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
//   }
// });

// router.put("/representants/:type", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
//   try {
//     const { error: typeError, value: type } = checkParameter(req.params.type);
//     if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

//     const isRequired = type !== "save";

//     const { error, value } = Joi.object({
//       parent1Status: needRequired(Joi.string().trim().valid("father", "mother", "other"), isRequired),
//       parent1FirstName: needRequired(validateFirstName().trim(), isRequired),
//       parent1LastName: needRequired(Joi.string().trim(), isRequired),
//       parent1Email: needRequired(Joi.string().lowercase().trim().email(), isRequired),
//       parent1Phone: needRequired(Joi.string().trim(), isRequired),
//       parent2: needRequired(Joi.string().trim().valid(true, false), isRequired),
//       parent2Status: Joi.alternatives().conditional("parent2", { is: true, then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
//       parent2FirstName: Joi.alternatives().conditional("parent2", { is: true, then: needRequired(validateFirstName().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
//       parent2LastName: Joi.alternatives().conditional("parent2", {
//         is: true,
//         then: needRequired(Joi.string().uppercase().trim(), isRequired),
//         otherwise: Joi.isError(new Error()),
//       }),
//       parent2Email: Joi.alternatives().conditional("parent2", {
//         is: true,
//         then: needRequired(Joi.string().lowercase().trim().email(), isRequired),
//         otherwise: Joi.isError(new Error()),
//       }),
//       parent2Phone: Joi.alternatives().conditional("parent2", { is: true, then: needRequired(Joi.string().trim(), isRequired), otherwise: Joi.isError(new Error()) }),
//     }).validate(req.body, { stripUnknown: true });

//     if (error) {
//       return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
//     }

//     const young = await YoungObject.findById(req.user._id);
//     if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

//     if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

//     if (!value.parent2) {
//       value.parent2Status = "";
//       value.parent2FirstName = "";
//       value.parent2LastName = "";
//       value.parent2Email = "";
//       value.parent2Phone = "";
//       value.parent2Inscription2023Token = "";
//     }

//     if (type === "next") {
//       value.inscriptionStep2023 = STEPS2023.DOCUMENTS;
//       value.parent1Inscription2023Token = crypto.randomBytes(20).toString("hex");
//       if (value.parent2) value.parent2Inscription2023Token = crypto.randomBytes(20).toString("hex");
//     }

//     young.set(value);
//     await young.save({ fromUser: req.user });
//     return res.status(200).send({ ok: true, data: serializeYoung(young) });
//   } catch (error) {
//     capture(error);
//     return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
//   }
// });

// router.put("/confirm", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
//   try {
//     const young = await YoungObject.findById(req.user._id);
//     if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

//     // If ID proof expires before session start, notify parent 1.
//     const notifyExpirationDate = young?.files?.cniFiles?.some((f) => f.expirationDate < START_DATE_SESSION_PHASE1[young.cohort]);

//     if (notifyExpirationDate) {
//       await sendTemplate(SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF, {
//         emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
//         params: { cta: `${config.APP_URL}/`, youngFirstName: young.firstName, youngName: young.lastName },
//       });
//     }

//     await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
//       emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
//       params: { cta: `${config.APP_URL}/`, youngFirstName: young.firstName, youngName: young.lastName },
//     });

//     if (young.parent2Email) {
//       await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_CONSENT, {
//         emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
//         params: { cta: `${config.APP_URL}/`, youngFirstName: young.firstName, youngName: young.lastName },
//       });
//     }

//     young.set({
//       informationAccuracy: "true",
//       inscriptionStep2023: STEPS2023.DONE,
//     });
//     await young.save({ fromUser: req.user });
//     return res.status(200).send({ ok: true, data: serializeYoung(young) });
//   } catch (error) {
//     capture(error);
//     return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
//   }
// });

router.put("/changeCohort", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
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

router.put("/documents", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set("reinscriptionStep2023", STEPS2023REINSCRIPTION.CONFIRM);
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// router.put("/relance", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
//   try {
//     const young = await YoungObject.findById(req.user._id);
//     if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

//     // If ID proof expires before session start, notify parent 1.
//     const notifyExpirationDate = young?.files?.cniFiles?.some((f) => f.expirationDate < START_DATE_SESSION_PHASE1[young.cohort]);

//     if (notifyExpirationDate) {
//       await sendTemplate(SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF, {
//         emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
//         params: { cta: `${config.APP_URL}/`, youngFirstName: young.firstName, youngName: young.lastName },
//       });
//     }

//     await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT1_CONSENT, {
//       emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
//       params: { cta: `${config.APP_URL}/`, youngFirstName: young.firstName, youngName: young.lastName },
//     });

//     if (young.parent2Email) {
//       await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_CONSENT, {
//         emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
//         params: { cta: `${config.APP_URL}/`, youngFirstName: young.firstName, youngName: young.lastName },
//       });
//     }

//     return res.status(200).send({ ok: true, data: serializeYoung(young) });
//   } catch (error) {
//     capture(error);
//     return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
//   }
// });

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
