const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { ROLES, canReadAlerteMessage, canCreateAlerteMessage } = require("snu-lib");
const { capture } = require("../../Services/sentry");
const { serializeAlerteMessage } = require("../../../Application/Utils/serializer");
const AlerteMessageModel = require("../../Databases/Mongo/Models/alerteMessage");
const { ERRORS } = require("../../../Application/Utils");
const { validateId } = require("../../../Application/Utils/validator");

router.get("/all", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    //seul les modérateurs peuvent voir tous les messages
    if (!canCreateAlerteMessage(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await AlerteMessageModel.find({ deletedAt: { $exists: false } });
    return res.status(200).send({ ok: true, data: data.map(serializeAlerteMessage) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canReadAlerteMessage(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await AlerteMessageModel.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeAlerteMessage(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// ici on ne prend que les messages destinés à un role précis
router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canReadAlerteMessage(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await AlerteMessageModel.find({ to_role: { $in: [req.user.role] }, deletedAt: { $exists: false } });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: data.map(serializeAlerteMessage) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      priority: Joi.string().required(),
      to_role: Joi.array().items(Joi.string()).required(),
      content: Joi.string().required(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canCreateAlerteMessage(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { priority, to_role, content } = value;

    if (content.length > 500) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const message = await AlerteMessageModel.create({ priority, to_role, content });

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
      to_role: Joi.array().items(Joi.string()).required(),
      content: Joi.string().required().max(500),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canCreateAlerteMessage(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { priority, to_role, content } = value;

    const message = await AlerteMessageModel.findById(value.id);
    if (!message) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    message.set({ priority: priority, to_role: to_role, content: content });
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

    const now = new Date();
    message.set({ deletedAt: now });
    await message.save({ fromUser: req.user });

    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
