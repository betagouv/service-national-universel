const express = require("express");
const router = express.Router();
const passport = require("passport");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const ModificationBusModel = require("../../models/PlanDeTransport/modificationBus");
const { ERRORS } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");
const {
  canCreateDemandeDeModification,
  canViewDemandeDeModification,
  canSendMessageDemandeDeModification,
  canEditStatusDemandeDeModification,
  canEditOpinionDemandeDeModification,
} = require("snu-lib");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      lineId: Joi.string().required(),
      message: Joi.string().required(),
    }).validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canCreateDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { lineId, message } = value;

    const line = await LigneBusModel.findById(lineId);
    if (!line) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    await ModificationBusModel.create({
      lineId: line._id.toString(),
      lineName: line.busId,
      requestMessage: message,
      requestUserId: req.user._id.toString(),
      requestUserName: req.user.firstName + " " + req.user.lastName,
      requestUserRole: req.user.role,
    });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/status", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      status: Joi.string().required().valid("ACCEPTED", "REJECTED"),
      id: Joi.string().required(),
    }).validate({ ...req.body, ...req.params });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canEditStatusDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { status, id } = value;

    const modif = await ModificationBusModel.findById(id);
    if (!modif) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    modif.set({
      status,
      statusUserId: req.user._id.toString(),
      statusUserName: req.user.firstName + " " + req.user.lastName,
      statusDate: new Date(),
    });

    await modif.save({ fromUser: req.user });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/opinion", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      opinion: Joi.boolean().required(),
      id: Joi.string().required(),
    }).validate({ ...req.body, ...req.params });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canEditOpinionDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { opinion, id } = value;

    const modif = await ModificationBusModel.findById(id);
    if (!modif) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    modif.set({
      opinion,
      opinionUserId: req.user._id.toString(),
      opinionUserName: req.user.firstName + " " + req.user.lastName,
      opinionDate: new Date(),
    });

    await modif.save({ fromUser: req.user });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/message", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      message: Joi.string().required(),
      id: Joi.string().required(),
    }).validate({ ...req.body, ...req.params });
    console.log(error);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canSendMessageDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { message, id } = value;

    const modif = await ModificationBusModel.findById(id);
    if (!modif) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    const messages = modif.messages || [];

    modif.set({ messages: [...messages, { message, userId: req.user._id.toString(), userName: req.user.firstName + " " + req.user.lastName, date: new Date() }] });

    await modif.save({ fromUser: req.user });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/ligne/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
    }).validate(req.params);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!canViewDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const lines = await ModificationBusModel.find({ lineId: id });

    return res.status(200).send({ ok: true, data: lines });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
