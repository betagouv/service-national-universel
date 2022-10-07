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

router.get("/young", tokenParentValidMiddleware, async (req, res) => {
  try {
    return res.status(200).send({ ok: true, data: serializeYoung(req.young) });
  } catch (e) {
    capture(e);
    return res.status(500).send(e);
  }
});

router.put("/representant-fromFranceConnect/:id", tokenParentValidMiddleware, async (req, res) => {
  console.log("coucou");
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

module.exports = router;
