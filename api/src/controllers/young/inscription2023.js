const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungObject = require("../../models/young");
const { capture } = require("../../sentry");
const { serializeYoung } = require("../../utils/serializer");
const { validateFirstName } = require("../../utils/validator");
const { ERRORS, STEPS2023, isYoung, isReferent, getCcOfYoung } = require("../../utils");
const { canSendTemplateToYoung, SENDINBLUE_TEMPLATES } = require("snu-lib");
const { config } = require("dotenv");
const { sendTemplate } = require("../../sendinblue");

router.put("/coordinates", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const { error, value } = Joi.object({
      gender: needRequired(Joi.string().trim().valid("female", "male"), isRequired),
      phone: needRequired(Joi.string().trim(), isRequired),
      // @todo validate remaining fields
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { gender, phone } = value;
    young.set({ gender, phone });
    // await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/consentement", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error } = Joi.object({
      consentment1: Joi.boolean().required().valid(true),
      consentment2: Joi.boolean().required().valid(true),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

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

    if (type === "next") young.set("inscriptionStep2023", STEPS2023.DONE);
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

router.post("/:id/emailtoparent/:template", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      template: Joi.string().required(),
      message: Joi.string().allow(null, ""),
      prevStatus: Joi.string().allow(null, ""),
      missionName: Joi.string().allow(null, ""),
      structureName: Joi.string().allow(null, ""),
      cta: Joi.string().allow(null, ""),
      type_document: Joi.string().allow(null, ""),
      object: Joi.string().allow(null, ""),
      link: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    // eslint-disable-next-line no-unused-vars
    const { id, template, message, prevStatus, missionName, structureName, cta, type_document, object, link } = value;

    // The template must exist.
    if (!Object.values(SENDINBLUE_TEMPLATES.young).includes(template)) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    // The young must exist.
    const young = await YoungObject.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // If actor is a young it must be the same as the young.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // If actor is a referent it must be allowed to send template.
    if (isReferent(req.user) && !canSendTemplateToYoung(req.user, young)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    let buttonCta = cta || config.APP_URL;
    if (template === SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_CORRECTION) buttonCta = `${config.APP_URL}/ma-preparation-militaire`;
    if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED)
      buttonCta = `${config.APP_URL}/inscription/coordonnees?utm_campaign=transactionnel+compte+cree&utm_source=notifauto&utm_medium=mail+219+acceder`;
    if (template === SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION)
      buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+nouvelles+mig+proposees&utm_source=notifauto&utm_medium=mail+170+acceder`;
    if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_REACTIVATED)
      buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+compte+reactive&utm_source=notifauto&utm_medium=mail+168+seconnecter`;
    if (template === SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED)
      buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+inscription+validee&utm_source=notifauto&utm_medium=mail+167+seconnecter`;
    if (buttonCta === SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_CORRECTION)
      buttonCta = `${config.APP_URL}?utm_campaign=transactionnel+dossier+attente+correction&utm_source=notifauto&utm_medium=mail+169+corriger`;

    let cc = getCcOfYoung({ template, young });
    await sendTemplate(template, {
      emailTo: [{ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email }],
      params: { youngFirstName: young.firstName, youngLastName: young.lastName, cta: buttonCta, message, missionName, structureName, type_document, object, link },
      cc,
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    console.log(error);
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
