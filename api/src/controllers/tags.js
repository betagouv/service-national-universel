const express = require("express");
const router = express.Router();
const { ERRORS } = require("../utils");
const { capture } = require("../sentry");
const Joi = require("joi");
const passport = require("passport");

const { TagsModel } = require("../models");

const { canCreateTags } = require("snu-lib");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
    }).validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canCreateTags(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { name, type } = value;
    const tag = await TagsModel.create({ name, type });

    return res.status(200).send({ ok: true, data: tag });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      type: Joi.string().required(),
    }).validate(req.query);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { type } = value;

    const tags = await TagsModel.find({ type });

    return res.status(200).send({ ok: true, data: tags });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
