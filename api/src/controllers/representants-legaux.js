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
const { canUpdateYoungStatus } = require("snu-lib");
const { capture } = require("../sentry");
const { serializeYoung } = require("../utils/serializer");

const { ERRORS } = require("../utils");

const { validateFirstName, validateString } = require("../utils/validator");

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
  return { fromUser: { ...young, firstName: young.parent1FirstName + " " + young.parent1LastName + "(Parent" + parent + ")" } };
}

router.get("/young", tokenParentValidMiddleware, async (req, res) => {
  try {
    return res.status(200).send({ ok: true, data: serializeYoung(req.young) });
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
  // --- validate data
  if (req.body.verified !== true) {
    return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
  }

  // --- update young
  req.young.set({ parent1DataVerified: true });
  await req.young.save(fromUser(req.young));

  // --- result
  return res.status(200).send({ ok: true, data: serializeYoung(req.young) });
});

router.post("/consent", tokenParentValidMiddleware, async (req, res) => {
  const id = req.query === "2" ? "2" : "1";

  // --- validate data
  const consentBodySchema = Joi.object({
    [`parent${id}FirstName`]: validateFirstName().trim().required(),
    [`parent${id}LastName`]: Joi.string().uppercase().required(),
    [`parent${id}Email`]: Joi.string().lowercase().required(),
    [`parent${id}Phone`]: Joi.string().required(),
    [`parent${id}AllowSNU`]: Joi.string().valid("true", "false").required(),
    [`parent${id}AllowCovidAutotest`]: Joi.string().valid("true", "false").required(),
    [`parent${id}AllowImageRights`]: Joi.string().valid("true", "false").required(),
    [`rulesParent${id}`]: Joi.string().valid("true").required(),

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
  });

  const result = consentBodySchema.validate(req.body, { stripUnknown: true });
  console.log("JOI RSULT = ", result);
  const { error, value } = result;
  if (error) {
    return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
  }

  // --- check rights
  const young = req.young;
  if (!young) {
    return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
  }

  let allowed;
  if (id !== "1" || young.parent2Status === undefined || young.parent2Status === null || young.parent2Status.trim().length === 0) {
    if (id === "1") {
      allowed = value.parent1AllowSNU === "true";
    } else {
      allowed = value.parent1AllowSNU === "true" && value.parent2AllowSNU === "true";
    }

    // TODO: le NOT_AUTHORIZED n'est pas le bon mais je n'ai pas trouvé le bon. A corriger.
    value.status = allowed ? "WAITING_VALIDATION" : "NOT_AUTHORIZED";
    if (!canUpdateYoungStatus({ body: value, current: young })) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
  }

  // --- update young
  young.set(value);
  await young.save(fromUser(young));

  // --- result
  return res.status(200).send({ ok: true, data: serializeYoung(req.young) });
});

module.exports = router;
