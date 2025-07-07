const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { capture } = require("../sentry");
const TicketModel = require("../models/ticket");
const MacroModel = require("../models/macro");
const AgentModel = require("../models/agent");
const FolderModel = require("../models/folder");
const TagModel = require("../models/tag");
const ShortcutModel = require("../models/shortcut");
const MessageModel = require("../models/message");
const { sendEmailWithConditions, getHoursDifference } = require("../utils");
const  { agentGuard } = require("../middlewares/authenticationGuards");
const { validateParams, validateBody, validateQuery, idSchema } = require("../middlewares/validation");
const { ERRORS } = require("../errors");
const { SCHEMA_ID, SCHEMA_TICKET_STATUS } = require("../schemas");

const SCHEMA_MACRO = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim(),
  isActive: Joi.boolean(),
  stayOnCurrentPage: Joi.boolean().optional().default(false),
  sendCurrentMessage: Joi.boolean().optional().default(false),
  macroAction: Joi.array().items(Joi.object({
    action: Joi.string().valid("SET", "DELETE", "ADDMESSAGE"),
    field: Joi.string().when('action', {
      switch: [
          { is: "DELETE", then: Joi.valid("tagsId") },
          { is: "ADDMESSAGE", then: Joi.valid("message") },
      ],
      otherwise: Joi.valid("notes.content", "subject", "status", "tagsId", "folder", "agentId")
    }),
    value: Joi.string().when('field', {
      switch: [
          { is: "status", then: SCHEMA_TICKET_STATUS },
          { is: "notes.content", then: Joi.string().trim() },
          { is: "subject", then: Joi.string().trim() },
      ],
      otherwise: SCHEMA_ID,
    }),
  }))
});

router.use(agentGuard);

router.post("/",
  validateBody(SCHEMA_MACRO.prefs({ presence: 'required' })),
  async (req, res) => {
    const { firstName, lastName, role, _id } = req.user;
    await MacroModel.create({ ...req.cleanBody, updatedBy: { firstName, lastName, role, _id } });
    return res.status(200).send({ ok: true });
  }
);

router.patch("/:id",
  validateParams(idSchema),
  validateBody(SCHEMA_MACRO.min(1)),
  async (req, res) => {
    const { firstName, lastName, role, _id } = req.user;
    const macro = await MacroModel.findById(req.cleanParams.id);
    if (!macro) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    macro.set({ ...req.cleanBody, updatedAt: new Date(), updatedBy: { firstName, lastName, role, _id } });
    await macro.save();

    return res.status(200).send({ ok: true });
  }
);

router.delete("/:id",
  validateParams(idSchema),
  async (req, res) => {
    await MacroModel.deleteOne({ _id: req.cleanParams.id });
    return res.status(200).send({ ok: true });
  }
);

router.post("/:id",
  validateParams(idSchema),
  validateBody(Joi.object({
    ticketsId: Joi.array().items(SCHEMA_ID),
    agentId: SCHEMA_ID,
  }).prefs({ presence: 'required' })),
  async (req, res) => {
    const agent = await AgentModel.findById(req.cleanBody.agentId);
    if (!agent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const macros = await MacroModel.findById(req.cleanParams.id);
    if (!macros) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    let ticketId = "";
    for (let tickId of req.cleanBody.ticketsId) {
      let ticket = await TicketModel.findById(tickId);
      if (ticket._id === ticketId) return res.status(200).send({ ok: true });
      ticketId = JSON.parse(JSON.stringify(ticket._id));
      // set default agent
      ticket.set({ agentId: agent._id, agentLastName: agent.lastName, agentFirstName: agent.firstName });
      for (let j = 0; j < macros.macroAction.length; j++) {
        const macroAction = macros.macroAction[j];
        if (macroAction.action === "SET") ticket = await setField(ticket, macroAction);
        if (macroAction.action === "DELETE") ticket = await deleteField(ticket, macroAction);
        if (macroAction.action === "ADDMESSAGE") ticket = await addShortcutMessage(ticket, macroAction, agent);
      }
      ticket.updatedAt = new Date();
      if (ticket.status === "CLOSED") {
        ticket.closedAt = new Date();
        if (!ticket.closedTimeHours) ticket.closedTimeHours = Number(getHoursDifference(new Date(), ticket.createdAt)).toFixed(2);
      }
      await ticket.save();
    }

    return res.status(200).send({ ok: true });
  }
);

router.get("/",
  validateQuery(Joi.object({
    isActive: Joi.boolean(),
  })),
  async (req, res) => {
    const macro = await MacroModel.find(req.cleanQuery);
    return res.status(200).send({ ok: true, data: macro });
  }
);

const setField = async (ticket, macroAction) => {
  try {
    if (macroAction.field === "tagsId") {
      const tag = await TagModel.findById(macroAction.value);

      if (!ticket.tagsId) ticket.tagsId = [];
      if (!ticket.tags) ticket.tags = [];

      ticket.set({
        tagsId: [...ticket.tagsId, tag._id],
        tags: [...ticket.tags, tag.name],
      });
    }

    if (macroAction.field === "folder") {
      const folder = await FolderModel.findById(macroAction.value);

      if (!ticket.foldersId) ticket.foldersId = [];
      if (!ticket.folders) ticket.folders = [];

      ticket.set({
        foldersId: [...ticket.foldersId, folder._id],
        folders: [...ticket.folders, folder.name],
      });
    }

    if (macroAction.field === "notes.content") {
      if (!ticket.notes) ticket.notes = [];
      ticket.notes.push({ content: macroAction.value, authorName: "supi-bot" });
    } else {
      Array.isArray(ticket[macroAction.field]) ? ticket[macroAction.field].push(macroAction.value) : ticket.set({ [macroAction.field]: macroAction.value });
    }

    if (macroAction.field === "agentId") {
      const agent = await AgentModel.findById(macroAction.value);
      ticket.set({ agentLastName: agent.lastName, agentFirstName: agent.firstName });
    }
    return ticket;
  } catch (error) {
    capture(error);
  }
};

const deleteField = async (ticket, macroAction) => {
  try {
    Array.isArray(ticket[macroAction.field])
      ? ticket.set({ [macroAction.field]: ticket[macroAction.field].filter((t) => t !== macroAction.value) })
      : delete ticket[macroAction.field];
    return ticket;
  } catch (error) {
    capture(error);
  }
};

const addShortcutMessage = async (ticket, macroAction, agent) => {
  try {
    const shortcut = await ShortcutModel.findOne({ _id: macroAction.value });
    const messageCount = await MessageModel.find({ ticketId: ticket._id }).countDocuments();
    if (messageCount === 1) {
      ticket.firstResponseAgentAt = new Date();
      ticket.firstResponseAgentTime = getHoursDifference(new Date(), ticket.createdAt);
    }
    ticket.messageCount = messageCount + 1;
    ticket.textMessage.push(shortcut.text);
    const message = await MessageModel.create({
      ticketId: ticket._id,
      authorId: agent._id,
      authorLastName: agent.lastName,
      authorFirstName: agent.firstName,
      text: shortcut.text,
      slateContent: shortcut.content,
    });

    if (ticket.canal === "MAIL") {
      await sendEmailWithConditions({ ticket, dest: ticket.contactEmail, lastMessageId: message._id });
    }
    return ticket;
  } catch (error) {
    capture(error);
  }
};

module.exports = router;
