const express = require("express");
const router = express.Router();
const passport = require("passport");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const ModificationBusModel = require("../../models/PlanDeTransport/modificationBus");
const { ERRORS } = require("../../utils");
const { capture } = require("../../sentry");
const Joi = require("joi");
const {
  ligneBusCanCreateDemandeDeModification,
  ligneBusCanViewDemandeDeModification,
  ligneBusCanSendMessageDemandeDeModification,
  ligneBusCanEditStatusDemandeDeModification,
  ligneBusCanEditOpinionDemandeDeModification,
  ligneBusCanEditTagsDemandeDeModification,
} = require("snu-lib");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      lineId: Joi.string().required(),
      message: Joi.string().required(),
    }).validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!ligneBusCanCreateDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { lineId, message } = value;

    const line = await LigneBusModel.findById(lineId);
    if (!line) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    await ModificationBusModel.create({
      lineId: line._id.toString(),
      lineName: line.busId,
      cohort: line.cohort,
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

    if (!ligneBusCanEditStatusDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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
      opinion: Joi.string().required().valid("true", "false"),
      id: Joi.string().required(),
    }).validate({ ...req.body, ...req.params });

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!ligneBusCanEditOpinionDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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

    if (!ligneBusCanSendMessageDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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

router.put("/:id/tag/:tagId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      tagId: Joi.string().required(),
      id: Joi.string().required(),
    }).validate({ ...req.body, ...req.params });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!ligneBusCanEditTagsDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { tagId, id } = value;

    const modif = await ModificationBusModel.findById(id);
    if (!modif) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    const tags = modif.tagIds || [];
    //check if tag already exist
    const tagExist = tags.find((tag) => tag === tagId);
    if (tagExist) return res.status(400).send({ ok: false, code: ERRORS.ALREADY_EXISTS });

    modif.set({ tagIds: [...tags, tagId] });

    await modif.save({ fromUser: req.user });

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/tag/:tagId/delete", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      tagId: Joi.string().required(),
      id: Joi.string().required(),
    }).validate({ ...req.body, ...req.params });
    console.log(error);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    if (!ligneBusCanEditTagsDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { tagId, id } = value;

    const modif = await ModificationBusModel.findById(id);
    if (!modif) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });

    const tags = modif.tagIds || [];

    modif.set({ tagIds: tags.filter((tag) => tag !== tagId) });

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

    if (!ligneBusCanViewDemandeDeModification(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { id } = value;

    const lines = await ModificationBusModel.find({ lineId: id });

    return res.status(200).send({ ok: true, data: lines });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
