/**
 * /reprensentants-legaux
 *
 * ROUTES
 *   GET   /young
 *   PUT   /representant-fromFranceConnect/:id
 *   POST  /data-verification
 *   POST  /consent
 */

const express = require("express");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungModel = require("../models/young");
const CohortModel = require("../models/cohort");
const { canUpdateYoungStatus, SENDINBLUE_TEMPLATES, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } = require("snu-lib");
const { capture } = require("../sentry");
const { serializeYoung } = require("../utils/serializer");

const { ERRORS } = require("../utils");

const { validateFirstName, validateString } = require("../utils/validator");
const { sendTemplate } = require("../sendinblue");
const { APP_URL } = require("../config");
const config = require("../config");

function tokenParentValidMiddleware(req, res, next) {
  const { error, value: token } = validateString(req.query.token);
  if (error || !token) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

  const field = req.query.parent === "2" ? "parent2Inscription2023Token" : "parent1Inscription2023Token";
  YoungModel.findOne({ [field]: token })
    .then((young) => {
      if (!young) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      req.young = young;
      next();
    })
    .catch((e) => res.status(500).send(e));
}

function fromUser(young, parent = 1) {
  return { fromUser: { ...young, firstName: young.parent1FirstName, lastName: young.parent1LastName + "(Parent" + parent + ")" } };
}

router.get("/young", tokenParentValidMiddleware, async (req, res) => {
  try {
    const cohortDetails = { name: req.young.cohort };
    const cohort = await CohortModel.findOne({ name: req.young.cohort });
    if (cohort) {
      cohortDetails.dateStart = cohort.dateStart;
      cohortDetails.dateEnd = cohort.dateEnd;
    }
    return res.status(200).send({ ok: true, data: { ...serializeYoung(req.young), cohort: cohortDetails } });
  } catch (e) {
    capture(e);
    return res.status(500).send(e);
  }
});

router.put("/representant-fromFranceConnect/:id", tokenParentValidMiddleware, async (req, res) => {
  try {
    const { error: error_id, value: id } = Joi.string().valid("1", "2").required().validate(req.params.id, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error, value } = Joi.object({
      [`parent${id}FirstName`]: validateFirstName().trim().required(),
      [`parent${id}LastName`]: Joi.string().uppercase().trim().required(),
      [`parent${id}Email`]: Joi.string().lowercase().trim().email().required(),
      [`parent${id}FromFranceConnect`]: Joi.string().trim().required().valid("true"),
    }).validate(req.body, { stripUnknown: true });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = req.young;
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

router.post("/data-verification", tokenParentValidMiddleware, async (req, res) => {
  try {
    // --- validate data
    const { error: error_id } = Joi.boolean().valid(true).required().validate(req.body.verified);
    if (error_id) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- update young
    const young = req.young;
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ parent1DataVerified: "true" });
    await young.save(fromUser(req.young));

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(req.young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/consent", tokenParentValidMiddleware, async (req, res) => {
  try {
    const { error: error_id, value: idstr } = Joi.string().valid("1", "2").required().validate(req.query.parent, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const id = parseInt(idstr);

    // --- validate data
    const commonSchema = {
      [`parent${id}FirstName`]: validateFirstName().trim().required(),
      [`parent${id}LastName`]: Joi.string().uppercase().required(),
      [`parent${id}Email`]: Joi.string().lowercase().required(),
      [`parent${id}Phone`]: Joi.string().required(),
      [`parent${id}PhoneZone`]: Joi.string().required(),
      [`parent${id}OwnAddress`]: Joi.string().valid("true", "false").required(),
      [`parent${id}Address`]: Joi.string().allow(""),
      [`parent${id}ComplementAddress`]: Joi.string().allow(""),
      [`parent${id}Zip`]: Joi.string().allow(""),
      [`parent${id}City`]: Joi.string().allow(""),
      [`parent${id}Country`]: Joi.string().allow(""),
      [`parent${id}CityCode`]: Joi.string().allow(""),
      [`parent${id}Region`]: Joi.string().allow(""),
      [`parent${id}Department`]: Joi.string().allow(""),
      [`parent${id}Location`]: Joi.any(),
      [`addressParent${id}Verified`]: Joi.string().valid("true", "false"),
    };

    let consentBodySchema;
    if (id === 1) {
      consentBodySchema = Joi.object().keys({
        ...commonSchema,
        ["parentAllowSNU"]: Joi.string().valid("true", "false").required(),

        // --- Demande de retirer l'autorisation de tests PCR pouyr l'instant. On laisse le code au cas où la demande s'inverserait :)
        // parent1AllowCovidAutotest: Joi.string()
        //   .valid("true", "false")
        //   .when("parentAllowSNU", {
        //     is: Joi.equal("true"),
        //     then: Joi.required(),
        //   }),
        parent1AllowImageRights: Joi.string()
          .valid("true", "false")
          .when("parentAllowSNU", {
            is: Joi.equal("true"),
            then: Joi.required(),
          }),
        rulesParent1: Joi.string()
          .valid("true")
          .when("parentAllowSNU", {
            is: Joi.equal("true"),
            then: Joi.required(),
          }),
      });
    } else {
      consentBodySchema = Joi.object().keys({
        ...commonSchema,
        parent2AllowImageRights: Joi.string().valid("true", "false").required(),
      });
    }

    const result = consentBodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      console.log("error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- check rights
    const young = req.young;
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (young.status === YOUNG_STATUS.REFUSED) {
      return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // --- fin du consentement ?
    let shouldSendToParent2 = false;
    let statusChanged = false;
    if (id === 1) {
      value.parent1ValidationDate = new Date();
      if (young.parentAllowSNU !== value.parentAllowSNU) {
        if (value.parentAllowSNU === "true") {
          value.status = YOUNG_STATUS.WAITING_VALIDATION;
        } else value.status = YOUNG_STATUS.NOT_AUTORISED;

        if (!canUpdateYoungStatus({ body: value, current: young })) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        }
        statusChanged = true;

        if (value.parentAllowSNU === "true" && value.parent1AllowImageRights === "true") {
          shouldSendToParent2 = true;
        }
        if (value.parent1AllowImageRights === "false") {
          value.imageRight = "false";
        }
      }
    } else {
      value.parent2ValidationDate = new Date();
      if (value.parent2AllowImageRights === "true" && young.parent1AllowImageRights === "true") {
        value.imageRight = "true";
      } else {
        value.imageRight = "false";
      }
    }

    if (shouldSendToParent2) {
      if (young.parent2Email == null || young.parent2Email.trim().length === 0) value.imageRight = "true";
      else {
        await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_CONSENT, {
          emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
          params: {
            cta: `${config.APP_URL}/representants-legaux/presentation-parent2?token=${young.parent2Inscription2023Token}`,
            youngFirstName: young.firstName,
            youngName: young.lastName,
          },
        });
      }
    }

    // --- Complete information for each parent.
    if (value.parentAllowSNU === "true" || value.parentAllowSNU === "false") {
      value[`parent${id}AllowSNU`] = value.parentAllowSNU;
    }

    // --- update young
    young.set(value);
    await young.save(fromUser(young, id));

    // --- envoie de mail
    if (statusChanged) {
      try {
        const emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];
        if (young.parentAllowSNU === "true") {
          await sendTemplate(SENDINBLUE_TEMPLATES.young.PARENT_CONSENTED, {
            emailTo,
            params: {
              cta: `${APP_URL}/`,
              SOURCE: young.source,
            },
          });
        } else {
          await sendTemplate(SENDINBLUE_TEMPLATES.young.PARENT_DID_NOT_CONSENT, { emailTo });
        }
      } catch (e) {
        capture(e);
      }
    }

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(req.young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/consent-image-rights", tokenParentValidMiddleware, async (req, res) => {
  try {
    const { error: error_id, value: idstr } = Joi.string().valid("1", "2").required().validate(req.query.parent, { stripUnknown: true });
    if (error_id) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const id = parseInt(idstr);

    // --- validate data
    const consentBodySchema = Joi.object().keys({
      [`parent${id}FirstName`]: validateFirstName().trim().required(),
      [`parent${id}LastName`]: Joi.string().uppercase().required(),
      [`parent${id}Email`]: Joi.string().lowercase().required(),
      [`parent${id}Phone`]: Joi.string().required(),
      [`parent${id}OwnAddress`]: Joi.string().valid("true", "false").required(),
      [`parent${id}Address`]: Joi.string().allow(""),
      [`parent${id}ComplementAddress`]: Joi.string().allow(""),
      [`parent${id}Zip`]: Joi.string().allow(""),
      [`parent${id}City`]: Joi.string().allow(""),
      [`parent${id}Country`]: Joi.string().allow(""),
      [`parent${id}CityCode`]: Joi.string().allow(""),
      [`parent${id}Region`]: Joi.string().allow(""),
      [`parent${id}Department`]: Joi.string().allow(""),
      [`parent${id}Location`]: Joi.any(),
      [`addressParent${id}Verified`]: Joi.string().valid("true", "false"),
      [`parent${id}AllowImageRights`]: Joi.string().valid("true", "false").required(),
    });
    const result = consentBodySchema.validate(req.body, { stripUnknown: true });
    const { error, value } = result;
    if (error) {
      console.log("error: ", error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- check rights
    const young = req.young;
    if (!young) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // --- update young
    young.set(value);
    if (young.parent2AllowImageRights !== "true" && young.parent2AllowImageRights !== "false") {
      young.set({ imageRight: young.parent1AllowImageRights });
    } else {
      young.set({ imageRight: young.parent1AllowImageRights === "true" && young.parent2AllowImageRights === "true" ? "true" : "false" });
    }
    if (id === 2) {
      young.set({ parent2AllowImageRightsReset: "false" });
    }
    await young.save(fromUser(young, id));

    // --- envoi notification parent 2 ?
    if (id === 1 && value.parent1AllowImageRights === "true" && young.parent2AllowImageRights !== "true" && young.parent2AllowImageRights !== "false") {
      if (young.parent2Email !== null && young.parent2Email !== undefined && young.parent2Email.trim().length > 0) {
        await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT2_RESEND_IMAGERIGHT, {
          emailTo: [{ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email }],
          params: {
            cta: `${config.APP_URL}/representants-legaux/droits-image2?token=${young.parent2Inscription2023Token}`,
            youngFirstName: young.firstName,
            youngName: young.lastName,
          },
        });
      }
    }

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(req.young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/cni-invalide", tokenParentValidMiddleware, async (req, res) => {
  try {
    // --- validate data
    const { error: error_id } = Joi.boolean().valid(true).required().validate(req.body.validated);
    if (error_id) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    // --- update young
    const young = req.young;
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ parentStatementOfHonorInvalidId: "true" });
    await young.save(fromUser(req.young));

    // --- result
    return res.status(200).send({ ok: true, data: serializeYoung(req.young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
