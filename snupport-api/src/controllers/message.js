const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { capture } = require("../sentry");
const MessageModel = require("../models/message");
const TicketModel = require("../models/ticket");
const AgentModel = require("../models/agent");
const { matchVentilationRule } = require("../utils/ventilation");

const { getFile, deleteFile, uploadAttachment, getHoursDifference, getSignedUrl, sendResponseTicket } = require("../utils");
const { decrypt, encrypt } = require("../utils/crypto");
const { getS3Path } = require("../utils/file");
const { agentGuard } = require("../middlewares/authenticationGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const { ERRORS } = require("../errors");
const { SCHEMA_ID, SCHEMA_PATH, SCHEMA_EMAIL } = require("../schemas");
const { canAccessTicket } = require("../utils/ticketScope");
const { inspectAttachment } = require("../utils/attachments");
const { isKnownThreadParticipant, normalizeEmail } = require("../utils/ticketParticipants");
const { sanitizeMessageHtml } = require("../utils/messageHtml");
const { attachmentUpload, MAX_ATTACHMENTS_PER_MESSAGE } = require("../middlewares/attachmentUpload");

router.use(agentGuard);

// Destinataires en copie d'une réponse (M88) : l'historique et les pièces jointes déchiffrées du ticket
// peuvent partir avec. On n'accepte que les participants du fil et les comptes du support (agents,
// référents), jamais une adresse arbitraire.
async function areAllowedCopyRecipients(ticket, recipients) {
  const unknown = (recipients || []).map(normalizeEmail).filter((email) => email && !isKnownThreadParticipant(ticket, email));
  if (!unknown.length) return true;
  const distinct = [...new Set(unknown)];
  const agents = await AgentModel.find({ email: { $in: distinct } }).select("email");
  return agents.length === distinct.length;
}

// Un attachment n'a pas de ticketId direct : il faut d'abord retrouver le message qui le
// référence (dans `files` ou `attachments`, alimentés par des flux différents) pour remonter
// à son ticket et vérifier le périmètre.
async function ticketForAttachmentPath(path) {
  const message = await MessageModel.findOne({ $or: [{ "files.path": path }, { "attachments.path": path }] });
  if (!message) return null;
  return TicketModel.findById(message.ticketId);
}

router.post(
  "/",
  validateBody(
    Joi.object({
      message: Joi.string(),
      ticketId: SCHEMA_ID,
      slateContent: Joi.array().optional(),
      copyRecipient: Joi.array().items(SCHEMA_EMAIL).optional(),
      dest: SCHEMA_EMAIL.optional(),
      messageHistory: SCHEMA_ID.allow(null, "all").optional(),
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const { message, ticketId, slateContent, copyRecipient, dest, messageHistory } = req.cleanBody;
    const user = req.user;
    let ticket = await TicketModel.findById(ticketId);
    if (!ticket) return res.status(400).send({ ok: false, code: ERRORS.WRONG_REQUEST });
    if (!canAccessTicket(user, ticket)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    // Avec messageHistory="all", la réponse emporte tout l'historique du ticket et ses pièces
    // jointes déchiffrées : le destinataire doit appartenir au fil, pas être une adresse
    // arbitraire passée en paramètre.
    if (dest && !isKnownThreadParticipant(ticket, dest)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    if (!(await areAllowedCopyRecipients(ticket, copyRecipient))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    // Le HTML de l'éditeur est rendu chez le jeune et part dans l'email officiel du support (M88, M92).
    const messageHtml = sanitizeMessageHtml(message);

    const messageCount = await MessageModel.find({ ticketId: ticket._id }).countDocuments();
    if (ticket.messageCount === 1) {
      ticket.firstResponseAgentAt = new Date();
      ticket.firstResponseAgentTime = getHoursDifference(new Date(), ticket.createdAt);
    }
    ticket.messageCount = messageCount + 1;
    ticket.updatedAt = new Date();
    ticket.messageDraft = "";
    ticket.status = "OPEN";
    ticket.textMessage.push(messageHtml);
    ticket.lastUpdateAgent = req.user._id;
    if (user.role === "AGENT") {
      ticket.agentId = user._id;
      ticket.agentLastName = user.lastName;
      ticket.agentFirstName = user.firstName;
      ticket.agentEmail = user.email;
    }
    if (user.role === "REFERENT_DEPARTMENT" || user.role === "REFERENT_REGION") {
      const agent = await AgentModel.findOne({ email: "contact@mail-support.snu.gouv.fr" });
      ticket.agentId = agent._id;
      ticket.agentLastName = agent.lastName;
      ticket.agentFirstName = agent.firstName;
      ticket.agentEmail = agent.email;
    }
    if (user.role === "REFERENT_DEPARTMENT") {
      ticket.referentDepartmentId = user._id;
      ticket.referentDepartmentFirstName = user.lastName;
      ticket.referentDepartmentLastName = user.firstName;
      ticket.referentDepartmentEmail = user.email;
    }
    if (user.role === "REFERENT_REGION") {
      ticket.referentRegionId = user._id;
      ticket.referentRegionFirstName = user.lastName;
      ticket.referentRegionLastName = user.firstName;
      ticket.referentRegionEmail = user.email;
    }
    if (ticket.status === "CLOSED") {
      ticket.closedAt = new Date();
      if (!ticket.closedTimeHours) ticket.closedTimeHours = Number(getHoursDifference(new Date(), ticket.createdAt)).toFixed(2);
    }
    ticket = await matchVentilationRule(ticket);
    await ticket.save();

    const dataMessage = await MessageModel.create({
      ticketId,
      authorId: req.user._id,
      authorLastName: req.user.lastName,
      authorFirstName: req.user.firstName,
      text: messageHtml,
      slateContent,
      copyRecipient,
      fromEmail: "contact@mail-support.snu.gouv.fr",
      toEmail: dest,
    });
    ticket.textMessage.push(messageHtml);

    await sendResponseTicket({ ticket, copyRecipient: dataMessage.copyRecipient, dest, messageHistory, lastMessageId: dataMessage._id, attachment: [] });

    return res.status(200).send({ ok: true, dataMessage });
  }
);

router.get(
  "/",
  validateQuery(
    Joi.object({
      ticketId: SCHEMA_ID,
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const ticket = await TicketModel.findById(req.cleanQuery.ticketId);
    if (!ticket) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canAccessTicket(req.user, ticket)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await MessageModel.find(req.cleanQuery);
    return res.status(200).send({ ok: true, data });
  }
);

// GET s3File buffer
router.post(
  "/s3file",
  validateBody(
    Joi.object({
      path: SCHEMA_PATH,
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const ticket = await ticketForAttachmentPath(req.cleanBody.path);
    if (!ticket) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canAccessTicket(req.user, ticket)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const file = await getFile(req.cleanBody.path);
    const buffer = decrypt(file.Body);
    return res.status(200).send({ ok: true, data: buffer });
  }
);

// GET s3File temp public url
router.post(
  "/s3file/publicUrl",
  validateBody(
    Joi.object({
      path: SCHEMA_PATH,
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const ticket = await ticketForAttachmentPath(req.cleanBody.path);
    if (!ticket) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canAccessTicket(req.user, ticket)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const file = await getFile(req.cleanBody.path);
    const data = decrypt(file.Body);
    // Le Content-Type stocké peut venir d'un expéditeur de mail : le resservir tel quel
    // laissait un SVG ou un HTML s'exécuter dans l'onglet de l'agent. On repart des magic
    // numbers, et un contenu non identifiable devient un binaire opaque.
    const { mime } = await inspectAttachment(data);
    // decrypt and upload the file to a temp private folder (deleted after 1 day)
    const tempPath = req.cleanBody.path.replace("message", "temp");
    await uploadAttachment(tempPath, { mimetype: mime ?? "application/octet-stream", data });
    // get a temp public url — en pièce jointe, jamais rendue dans la page
    const url = await getSignedUrl(tempPath, { download: true });
    return res.status(200).send({ ok: true, data: url });
  }
);

router.delete(
  "/s3file/:id",
  validateParams(idSchema),
  validateBody(
    Joi.object({
      path: SCHEMA_PATH,
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const message = await MessageModel.findById(req.cleanParams.id);
    if (!message) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const ticket = await TicketModel.findById(message.ticketId);
    if (!ticket) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!canAccessTicket(req.user, ticket)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    // Le chemin supprimé doit être une pièce jointe de CE message : sinon un agent effaçait n'importe
    // quel objet du bucket support, hors de son périmètre (M87).
    if (!(message.files || []).some((file) => file.path === req.cleanBody.path)) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    await deleteFile(req.cleanBody.path);
    message.files = message.files.filter((file) => file.path !== req.cleanBody.path);
    await message.save();
    return res.status(200).send({ ok: true });
  }
);

const SEND_EMAIL_FILE_SCHEMA = Joi.object({
  message: Joi.string().allow("").required(),
  copyRecipient: Joi.array().items(SCHEMA_EMAIL).default([]),
  dest: SCHEMA_EMAIL.optional(),
  messageHistory: SCHEMA_ID.allow(null, "all").optional(),
}).unknown();

router.post(
  "/sendEmailFile/:id",
  attachmentUpload,
  validateParams(idSchema),
  validateBody(
    Joi.object({
      body: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const id = req.cleanParams.id;
    let ticket = await TicketModel.findById(id);
    if (!ticket) return res.status(400).send({ ok: false, code: ERRORS.WRONG_REQUEST });
    if (!canAccessTicket(req.user, ticket)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    let parsedBody;

    try {
      if (typeof req.cleanBody.body === "string") {
        parsedBody = JSON.parse(req.cleanBody.body);
      }

      if (Array.isArray(req.cleanBody.body)) {
        parsedBody = JSON.parse(req.cleanBody.body[0]);
      }

      if (!parsedBody) {
        throw new Error("req.cleanBody.body is not a string or an array of strings");
      }
    } catch (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.WRONG_REQUEST, error: "Invalid request format" });
    }

    // Le corps arrive en JSON dans un champ multipart : il échappe à validateBody, on le valide ici.
    const { error: bodyError, value: body } = SEND_EMAIL_FILE_SCHEMA.validate(parsedBody);
    if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.WRONG_REQUEST });
    const { copyRecipient, dest, messageHistory } = body;
    // Même règle que POST /message : la réponse peut emporter tout l'historique et les pièces
    // jointes déchiffrées du ticket.
    if (dest && !isKnownThreadParticipant(ticket, dest)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    if (!(await areAllowedCopyRecipients(ticket, copyRecipient))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    const messageHtml = sanitizeMessageHtml(body.message);

    // If multiple file with same names are provided, file is an array: every entry is kept and checked.
    const files = Object.values(req.files || {}).flat();
    if (files.length > MAX_ATTACHMENTS_PER_MESSAGE) return res.status(400).send({ ok: false, code: ERRORS.WRONG_REQUEST });

    // Pièces jointes (L50) : le type est déduit des magic numbers, jamais du nom ni du mimetype envoyés
    // par le client, et l'extension stockée vient du type détecté.
    const inspectedFiles = [];
    for (const file of files) {
      const { mime, accepted } = await inspectAttachment(file.data);
      if (!accepted) return res.status(400).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      inspectedFiles.push({ name: file.name, data: file.data, mime });
    }

    const mailFormatFiles = inspectedFiles.map((file) => ({ content: file.data.toString("base64"), name: file.name }));

    const message = await MessageModel.create({
      ticketId: ticket._id,
      authorId: req.user._id,
      authorLastName: req.user.lastName,
      authorFirstName: req.user.firstName,
      text: `${messageHtml}`,
      copyRecipient,
    });
    await sendResponseTicket({ ticket, copyRecipient, dest, attachment: mailFormatFiles, messageHistory, lastMessageId: message._id });
    for (const file of inspectedFiles) {
      const { name, data, mime } = file;
      const path = getS3Path(name, mime);
      const encryptedBuffer = encrypt(data);
      const encryptedFile = { mimetype: mime, encoding: "7bit", data: encryptedBuffer };
      const url = await uploadAttachment(path, encryptedFile);
      if (url) {
        message.files.push({ name: file.name, path, url });
      }
    }
    await message.save();
    ticket.messageCount = ticket.messageCount + 1;
    ticket.updatedAt = new Date();
    ticket.messageDraft = "";
    ticket.status = "CLOSED";
    ticket.textMessage.push(messageHtml);
    ticket.lastUpdateAgent = req.user._id;
    await ticket.save();
    return res.status(200).send({ ok: true });
  }
);

module.exports = router;
