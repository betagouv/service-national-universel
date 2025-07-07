const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { capture } = require("../sentry");
const MessageModel = require("../models/message");
const TicketModel = require("../models/ticket");
const AgentModel = require("../models/agent");
const { matchVentilationRule } = require("../utils/ventilation");

const { sendEmailWithConditions, getFile, deleteFile, uploadAttachment, getHoursDifference, sendNotif, SENDINBLUE_TEMPLATES, getSignedUrl } = require("../utils");
const { decrypt, encrypt } = require("../utils/crypto");
const { getS3Path } = require("../utils/file");
const { agentGuard } = require("../middlewares/authenticationGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const { ERRORS } = require("../errors");
const { SCHEMA_ID, SCHEMA_PATH, SCHEMA_EMAIL } = require("../schemas");

router.use(agentGuard);

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

    const messageCount = await MessageModel.find({ ticketId: ticket._id }).countDocuments();
    if (ticket.messageCount === 1) {
      ticket.firstResponseAgentAt = new Date();
      ticket.firstResponseAgentTime = getHoursDifference(new Date(), ticket.createdAt);
    }
    ticket.messageCount = messageCount + 1;
    ticket.updatedAt = new Date();
    ticket.messageDraft = "";
    ticket.status = "OPEN";
    ticket.textMessage.push(message);
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
      text: message,
      slateContent,
      copyRecipient,
      fromEmail: "contact@mail-support.snu.gouv.fr",
      toEmail: dest,
    });
    ticket.textMessage.push(message);

    const lastMessage = ticket.textMessage[ticket.textMessage.length - 1].replace(/\\n/g, "<br>");

    if (ticket.canal === "MAIL" || ticket.contactGroup === "unknown") {
      console.log("Sending email for ticket", ticket._id);
      await sendEmailWithConditions({ ticket, copyRecipient: dataMessage.copyRecipient, dest, messageHistory, lastMessageId: dataMessage._id });
    } else {
      await sendNotif({ ticket, templateId: SENDINBLUE_TEMPLATES.ANSWER_RECEIVED, message: lastMessage });
    }

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
    const file = await getFile(req.cleanBody.path);
    // decrypt and upload the file to a temp private folder (deleted after 1 day)
    const tempPath = req.cleanBody.path.replace("message", "temp");
    await uploadAttachment(tempPath, { mimetype: file.ContentType, data: decrypt(file.Body) });
    // get a temp public url
    const url = await getSignedUrl(tempPath);
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
    await deleteFile(req.cleanBody.path);
    const message = await MessageModel.findById(req.cleanParams.id);
    message.files = message.files.filter((file) => file.path !== req.cleanBody.path);
    await message.save();
    return res.status(200).send({ ok: true });
  }
);

router.post(
  "/sendEmailFile/:id",
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

    const { message: messageHtml, copyRecipient, dest, messageHistory } = parsedBody;
    const files = Object.keys(req.files || {}).map((e) => req.files[e]);
    // If multiple file with same names are provided, file is an array. We just take the latest.

    const mailFormatFiles = [];
    for (let file of files) {
      let base64content = file.data.toString("base64");
      mailFormatFiles.push({ content: base64content, name: file.name });
    }

    const message = await MessageModel.create({
      ticketId: ticket._id,
      authorId: req.user._id,
      authorLastName: req.user.lastName,
      authorFirstName: req.user.firstName,
      text: `${messageHtml}`,
      copyRecipient,
    });
    if (ticket.canal === "MAIL") {
      await sendEmailWithConditions({ ticket, copyRecipient, dest, attachment: mailFormatFiles, messageHistory, lastMessageId: message._id });
    }
    for (let file of files) {
      const { name, data, mimetype } = file;
      const path = getS3Path(name);
      const encryptedBuffer = encrypt(data);
      const encryptedFile = { mimetype, encoding: "7bit", data: encryptedBuffer };
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
