const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { canCreateAlerteMessage, ROLES } = require("snu-lib");
const { capture } = require("../../sentry");
const { serializeAlerteMessage } = require("../../utils/serializer");
const AlerteMessageModel = require("../../models/alerteMessage");
const { ERRORS } = require("../../utils");
const { validateId } = require("../../utils/validator");

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canCreateAlerteMessage(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await AlerteMessageModel.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeAlerteMessage(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      priority: Joi.string().required(),
      role: Joi.array().items(Joi.string()).required(),
      content: Joi.string().required(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canCreateAlerteMessage(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { priority, role, content } = value;

    if (content.length > 500) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const message = await AlerteMessageModel.create({ priority, role, content });

    return res.status(200).send({ ok: true, data: serializeAlerteMessage(message) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      priority: Joi.string().required(),
      role: Joi.array().items(Joi.string()).required(),
      content: Joi.string().required(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canCreateAlerteMessage(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { priority, role, content } = value;

    if (content.length > 500) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const message = await AlerteMessageModel.findById(value.id);
    if (!message) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    message.set({ priority: priority, role: role, content: content });
    await message.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeAlerteMessage(message) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (req.user.role !== ROLES.ADMIN) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const message = await AlerteMessageModel.findById(id);
    if (!message) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await message.remove();
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
