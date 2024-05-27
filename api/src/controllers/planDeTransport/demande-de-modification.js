const express = require("express");
const router = express.Router();
const passport = require("passport");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const PlanTransportModel = require("../../models/PlanDeTransport/planTransport");
const ModificationBusModel = require("../../models/PlanDeTransport/modificationBus");
const ReferentModel = require("../../models/referent");
const CohortModel = require("../../models/cohort");
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
  SENDINBLUE_TEMPLATES,
  ROLES,
  isLigneBusDemandeDeModificationOpen,
} = require("snu-lib");
const { ObjectId } = require("mongoose").Types;
const { sendTemplate } = require("../../sendinblue");
const config = require("config");

const updateModificationDependencies = async (modif, fromUser) => {
  const planDeTransport = await PlanTransportModel.findOne({ "modificationBuses._id": ObjectId(modif._id) });
  const modificationBus = planDeTransport.modificationBuses.find((modificationBus) => modificationBus._id.toString() === modif._id.toString());
  const copyModif = JSON.parse(JSON.stringify(modif));
  modificationBus.set({ ...copyModif });
  await planDeTransport.save({ fromUser });
};

const fixedReferents =
  config.ENVIRONMENT === "production"
    ? [
        {
          firstName: "Edouard",
          lastName: "VIZCAINO",
          email: "edouard.vizcaino@jeunesse-sports.gouv.fr",
        },
        {
          firstName: "Christelle",
          lastName: "BIGNON",
          email: "christelle.bignon@jeunesse-sports.gouv.fr",
        },
      ]
    : [];

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

    const cohort = await CohortModel.findOne({ name: line.cohort });
    if (!cohort) return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });
    console.log(cohort);
    if (!isLigneBusDemandeDeModificationOpen(req.user, cohort)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const modificationBus = await ModificationBusModel.create({
      lineId: line._id.toString(),
      lineName: line.busId,
      cohort: line.cohort,
      requestMessage: message,
      requestUserId: req.user._id.toString(),
      requestUserName: req.user.firstName + " " + req.user.lastName,
      requestUserRole: req.user.role,
    });

    const planDeTransport = await PlanTransportModel.findById(line._id);
    const copyModif = JSON.parse(JSON.stringify(modificationBus));
    if (!planDeTransport.modificationBuses) planDeTransport.modificationBuses = [copyModif];
    else planDeTransport.modificationBuses.push(copyModif);

    const referentTransporters = await ReferentModel.find({ role: ROLES.TRANSPORTER });

    await planDeTransport.save({ fromUser: req.user });

    for (const referentTransporter of [...referentTransporters, ...fixedReferents]) {
      await sendTemplate(SENDINBLUE_TEMPLATES.PLAN_TRANSPORT.DEMANDE_DE_MODIFICATION, {
        emailTo: [{ name: `${referentTransporter.firstName} ${referentTransporter.lastName}`, email: referentTransporter.email }],
        params: {
          busId: line.busId,
          requestUserFirstname: req.user.firstName,
          requestUserLastname: req.user.lastName,
          region: req.user.region,
          cta: `${config.ADMIN_URL}/ligne-de-bus/${lineId}?demande=${modificationBus._id}`,
        },
      });
    }

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

    await updateModificationDependencies(modif, req.user);

    const referentTransporters = await ReferentModel.find({ role: ROLES.TRANSPORTER });

    const template = status === "ACCEPTED" ? SENDINBLUE_TEMPLATES.PLAN_TRANSPORT.MODIFICATION_ACCEPTEE : SENDINBLUE_TEMPLATES.PLAN_TRANSPORT.MODIFICATION_REFUSEE;

    for (const referentTransporter of [...referentTransporters, ...fixedReferents]) {
      await sendTemplate(template, {
        emailTo: [{ name: `${referentTransporter.firstName} ${referentTransporter.lastName}`, email: referentTransporter.email }],
        params: {
          busId: modif.lineName,
          requestUserFirstname: req.user.firstName,
          requestUserLastname: req.user.lastName,
          region: req.user.region,
          cta: `${config.ADMIN_URL}/ligne-de-bus/${modif.lineId}?demande=${modif._id}`,
        },
      });
    }

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

    await updateModificationDependencies(modif, req.user);

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

    await updateModificationDependencies(modif, req.user);

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
