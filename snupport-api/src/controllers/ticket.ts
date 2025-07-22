import express, { Response } from "express";
import Joi from "joi";
import TicketModel from "../models/ticket";
import ContactModel from "../models/contact";
import AgentModel from "../models/agent";
import MessageModel from "../models/message";
import TagModel from "../models/tag";
import { agentGuard } from "../middlewares/authenticationGuards";
import { validateParams, validateBody, validateQuery, idSchema } from "../middlewares/validation";
import { ERRORS } from "../errors";
import { SCHEMA_ID, SCHEMA_EMAIL, SCHEMA_PARCOURS, SCHEMA_TICKET_STATUS } from "../schemas";
import { sendEmailWithConditions, weekday, getHoursDifference, sendNotif, SENDINBLUE_TEMPLATES, diacriticSensitiveRegex } from "../utils";
import { matchVentilationRule } from "../utils/ventilation";
import { UserRequest } from "./request";
const escapeStringRegexp = require("escape-string-regexp");

const router = express.Router();

router.use(agentGuard);

const SCHEMA_CONTACT_GROUP = Joi.string().valid(
  "unknown",
  "admin exterior",
  "young exterior",
  "responsible",
  "supervisor",
  "head_center",
  "referent_region",
  "referent_department",
  "visitor",
  "young",
  "parent",
  "admin",
  "administrateur_cle",
  "referent_classe",
  "transporter",
  "dsnj",
  "injep",
  "moderator"
);
const SCHEMA_PERIOD = Joi.object({
  period: Joi.number().integer().positive().default(7),
  startDate: Joi.date(),
  endDate: Joi.date(),
});
const SCHEMA_DATERANGE = Joi.object({
  from: Joi.date(),
  to: Joi.date(),
});

router.post(
  "/",
  validateBody(
    Joi.object({
      subject: Joi.string().trim(),
      contactEmail: SCHEMA_EMAIL,
      canal: Joi.string().valid("MAIL", "PLATFORM"),
      message: Joi.string().trim(),
      tags: Joi.array().items(SCHEMA_ID).optional(),
      copyRecipients: Joi.array().items(SCHEMA_EMAIL).optional(),
      files: Joi.array().items(Joi.object()).optional(),
      agentId: SCHEMA_ID.optional(),
    }).prefs({ presence: "required" })
  ),
  async (req: UserRequest, res: Response) => {
    const { subject, contactEmail, canal, tags, message, copyRecipients, files, agentId } = req.cleanBody;

    const user = req.user;

    let contact = await ContactModel.findOne({ email: contactEmail });
    if (!contact) contact = await ContactModel.create({ email: contactEmail });

    if (!contact) return res.status(402).send({ ok: false, code: ERRORS.WRONG_REQUEST });
    const lastTicket = await TicketModel.find().sort({ number: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(1);

    const ticket: any = {
      number: Number(lastTicket[0].number) + 1,
      contactId: contact._id,
      contactLastName: contact.lastName,
      contactFirstName: contact.firstName,
      contactEmail: contact.email,
      contactAttributes: contact.attributes,
      contactGroup: contact.attributes?.find((att) => att?.name === "role")?.value || "unknown",
      contactDepartment: contact.attributes?.find((att) => att?.name === "departement")?.value,
      contactCohort: contact.attributes?.find((att) => att?.name === "cohorte")?.value,
      contactRegion: contact.attributes?.find((att) => att?.name === "region")?.value,
      source: "PLATFORM",
      status: "CLOSED",
      tagsId: tags,
      subject,
      lastUpdateAgent: req.user._id,
      canal,
      createdHourAt: new Date().getHours(),
      createdDayAt: weekday[new Date().getDay()],
      createdBy: req.user.role,
    };

    if (user.role === "AGENT") {
      const agent = agentId ? await AgentModel.findById(agentId) : null;
      ticket.agentLastName = agent ? agent.lastName : user.lastName;
      ticket.agentFirstName = agent ? agent.firstName : user.firstName;
      ticket.agentEmail = agent ? agent.email : user.email;
    }
    if (user.role === "REFERENT_DEPARTMENT" || user.role === "REFERENT_REGION") {
      const defaultReferent = await AgentModel.findOne({ isReferent: true });
      ticket.agentId = defaultReferent && defaultReferent._id;
      ticket.agentLastName = defaultReferent && defaultReferent.lastName;
      ticket.agentFirstName = defaultReferent && defaultReferent.firstName;
      ticket.agentEmail = defaultReferent && defaultReferent.email;
    }
    if (user.role === "REFERENT_DEPARTMENT") {
      ticket.referentDepartmentId = user._id;
      ticket.referentDepartmentFirstName = user.lastName;
      ticket.referentDepartmentLastName = user.firstName;
      ticket.referentDepartmentEmail = user.email;
      ticket.formSubjectStep1 = "QUESTION";
    }
    if (user.role === "REFERENT_REGION") {
      ticket.referentRegionId = user._id;
      ticket.referentRegionFirstName = user.lastName;
      ticket.referentRegionLastName = user.firstName;
      ticket.referentRegionEmail = user.email;
      ticket.formSubjectStep1 = "QUESTION";
    }
    let newTicket: any = await TicketModel.create(ticket);
    if (!newTicket) return res.status(400).send({ ok: false, code: ERRORS.WRONG_REQUEST });
    newTicket = await matchVentilationRule(newTicket);
    await newTicket.save();

    if (files.length === 0) {
      let newMessage = await MessageModel.create({
        ticketId: newTicket._id,
        text: message,
        authorId: user._id,
        authorFirstName: user.firstName,
        authorLastName: user.lastName,
        copyRecipient: copyRecipients,
        fromEmail: "contact@mail-support.snu.gouv.fr",
        toEmail: contact.email,
      });
      if (newTicket.canal === "MAIL") {
        await sendEmailWithConditions({
          ticket: newTicket,
          dest: contact.email,
          copyRecipient: copyRecipients,
          lastMessageId: newMessage._id,
          attachment: null,
          messageHistory: null,
        });
      } else {
        await sendNotif({ ticket: newTicket, templateId: SENDINBLUE_TEMPLATES.NEW_TICKET, message: undefined, attachment: [] });
      }
      if (!newMessage) return res.status(400).send({ ok: false, code: ERRORS.WRONG_REQUEST });
    }

    return res.status(200).send({ ok: true, data: { ticket: newTicket } });
  }
);

export interface DateRange {
  from?: string;
  to?: string;
}

export interface PostSearchRequestBody {
  size?: number;
  page?: number;
  folderId?: string;
  tag?: string[] | string;
  status?: string;
  contactId?: string;
  agentId?: string;
  ticketId?: string;
  sources?: string[];
  contactGroup?: string[];
  contactDepartment?: string[];
  contactCohort?: string[];
  parcours?: string[];
  creationDate?: DateRange;
  lastActivityDate?: DateRange;
  agent?: string[];
  sorting?: string;
}

function buildSorting(req): any {
  if (req.cleanBody.sorting === "AGENT") {
    return { agentLastName: "asc", agentFirstName: "asc" };
  } else if (req.cleanBody.sorting === "CREATIONDATE") {
    return { createdAt: "desc" };
  } else {
    return { updatedAt: "desc" };
  }
}

function autocomplete_regex(query) {
  const pattern = diacriticSensitiveRegex(escapeStringRegexp(query));
  return `^${pattern}.*$`;
}

function buildContextFilter(req) {
  const filter: any = {};

  // Filtrage par statut
  if (req.cleanBody.status === "TOTREAT") {
    filter.status = { $in: ["NEW", "OPEN", "PENDING"] };
  } else if (req.cleanBody.status === "all") {
    filter.status = { $in: ["NEW", "OPEN", "PENDING", "CLOSED"] };
  } else if (req.cleanBody.status) {
    filter.status = req.cleanBody.status;
  }

  // Filtrage par dossier
  if (req.cleanBody.folderId) {
    filter.foldersId = req.cleanBody.folderId;
  }

  // Gestion des tags
  if (req.cleanBody.tag?.length && req.cleanBody.tag !== "null") {
    // Doit avoir tous les tags spécifiés
    filter.tagsId = { $all: req.cleanBody.tag };
  }
  // Recherche des tickets sans tags
  else if (req.cleanBody.tag && req.cleanBody.tag === "null") {
    filter.tagsId = { $size: 0 };
  }

  // Ajout de la recherche avancée si présente
  if (req.cleanBody.advancedSearch) {
    const regex = {
      $regex: autocomplete_regex(req.cleanBody.advancedSearch),
      $options: "i",
    };
    filter.$or = [{ number: regex }, { subject: regex }, { contactEmail: regex }, { contactLastName: regex }];
  }

  // Filtrage par contact
  if (req.cleanBody.contactId) {
    filter.contactId = req.cleanBody.contactId;
  }

  // Gestion des permissions selon le rôle de l'utilisateur
  if (req.user.role === "AGENT" && req.cleanBody.agentId) {
    filter.agentId = req.cleanBody.agentId;
  } else if (req.user.role === "REFERENT_DEPARTMENT" && req.cleanBody.agentId) {
    filter.referentDepartmentId = req.cleanBody.agentId;
  } else if (req.user.role === "REFERENT_REGION" && req.cleanBody.agentId) {
    filter.referentRegionId = req.cleanBody.agentId;
  }

  // Filtres additionnels
  if (req.cleanBody.ticketId) {
    filter._id = req.cleanBody.ticketId;
  }
  if (req.cleanBody.sources?.length) {
    filter.source = req.cleanBody.sources;
  }
  if (req.cleanBody.contactGroup?.length) {
    filter.contactGroup = req.cleanBody.contactGroup;
  }
  if (req.cleanBody.contactDepartment?.length) {
    filter.contactDepartment = req.cleanBody.contactDepartment;
  }
  if (req.cleanBody.contactCohort?.length) {
    filter.contactCohort = req.cleanBody.contactCohort;
  }
  if (req.cleanBody.parcours?.length) {
    filter.parcours = req.cleanBody.parcours;
  }

  // Filtres par date
  if (req.cleanBody.creationDate) {
    const creationDate = req.cleanBody.creationDate;
    if (creationDate.from && creationDate.to) {
      filter.createdAt = {
        $gte: creationDate.from,
        $lte: creationDate.to,
      };
    }
  }
  if (req.cleanBody.lastActivityDate) {
    const lastActivityDate = req.cleanBody.lastActivityDate;
    if (lastActivityDate.from && lastActivityDate.to) {
      filter.updatedAt = {
        $gte: lastActivityDate.from,
        $lte: lastActivityDate.to,
      };
    }
  }

  // Gestion spéciale des agents non assignés
  if (req.cleanBody.agent?.includes("undefined")) {
    filter.agentId = null;
  } else if (req.cleanBody.agent?.length) {
    filter.agentId = { $in: req.cleanBody.agent };
  }

  // Restrictions supplémentaires basées sur le rôle
  if (req.user.role === "REFERENT_REGION") {
    filter.contactRegion = req.user.region;
    filter.formSubjectStep1 = "QUESTION";
  }
  if (req.user.role === "REFERENT_DEPARTMENT") {
    filter.contactDepartment = { $in: req.user.departments };
    filter.formSubjectStep1 = "QUESTION";
  }
  return filter;
}

function formatAggregation(aggregation) {
  const index = {};
  for (let item of aggregation) {
    const { key, status } = item._id;
    if (!index[key]) {
      index[key] = { key, status: { buckets: [] } };
    }
    index[key].status.buckets.push({ key: status, doc_count: item.doc_count });
  }
  return Object.values(index);
}

router.post(
  "/search",
  validateBody(
    Joi.object({
      size: Joi.number().default(10).integer().positive(),
      page: Joi.number().default(1).integer().positive(),
      folderId: SCHEMA_ID,
      tag: Joi.alternatives().try(Joi.string().valid("null"), Joi.array().items(SCHEMA_ID)),
      status: Joi.string().valid("TOTREAT", "NEW", "OPEN", "PENDING", "CLOSED", "DRAFT", "all"),
      contactId: SCHEMA_ID,
      agentId: SCHEMA_ID,
      ticketId: SCHEMA_ID,
      sorting: Joi.string().valid("AGENT", "CREATIONDATE", "UPDATEDATE"),
      sources: Joi.array().items(Joi.string().valid("MAIL", "FORM", "PLATFORM", "CHAT")),
      contactGroup: Joi.array().items(SCHEMA_CONTACT_GROUP),
      contactDepartment: Joi.array().items(Joi.string().trim()),
      contactCohort: Joi.array().items(Joi.string().trim()),
      parcours: Joi.array().items(SCHEMA_PARCOURS),
      advancedSearch: Joi.string().trim(),
      agent: Joi.array().items(Joi.alternatives().try(SCHEMA_ID, Joi.string().valid("undefined"))),
      creationDate: SCHEMA_DATERANGE,
      lastActivityDate: SCHEMA_DATERANGE,
    })
  ),
  async (req: UserRequest, res: Response) => {
    const filter = buildContextFilter(req);
    const total = await TicketModel.countDocuments(filter);
    const tickets = await TicketModel.find(filter)
      .skip((req.cleanBody.page - 1) * req.cleanBody.size)
      .limit(req.cleanBody.size)
      .sort(buildSorting(req));

    // Filtrage des conditions pour les agrégations (exclusion des filtres status et folder)
    delete filter.status;
    delete filter.foldersId;

    const statusAggregation = await TicketModel.aggregate([
      { $match: filter },
      { $group: { _id: "$status", doc_count: { $sum: 1 } } },
      { $project: { _id: 0, key: "$_id", doc_count: 1 } },
    ]);

    const tagAggregation = await TicketModel.aggregate([
      { $match: filter },
      { $project: { _id: 0, tagsId: 1, status: 1 } },
      { $unwind: { path: "$tagsId", preserveNullAndEmptyArrays: false } },
      { $group: { _id: { key: "$tagsId", status: "$status" }, doc_count: { $sum: 1 } } },
    ]);

    const contactDepartmentAggregation = await TicketModel.aggregate([
      { $match: filter },
      { $project: { _id: 0, contactDepartment: 1, status: 1 } },
      { $unwind: { path: "$contactDepartment", preserveNullAndEmptyArrays: false } },
      { $group: { _id: { key: "$contactDepartment", status: "$status" }, doc_count: { $sum: 1 } } },
    ]);

    res.status(200).send({
      ok: true,
      total,
      data: tickets,
      aggregations: {
        status: statusAggregation,
        tag: formatAggregation(tagAggregation),
        contactDepartment: formatAggregation(contactDepartmentAggregation),
      },
    });
  }
);

router.get(
  "/searchAll",
  validateQuery(
    Joi.object({
      q: Joi.string().trim().default(""),
      limit: Joi.number().integer().positive().optional().default(10),
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    if (req.cleanQuery.q.length < 3) {
      res.status(200).send({
        ok: true,
        data: [],
      });
      return;
    }
    const regex = {
      $regex: autocomplete_regex(req.cleanQuery.q),
      $options: "i",
    };
    const filter: any = {
      $or: [{ number: regex }, { subject: regex }, { contactEmail: regex }, { contactLastName: regex }],
    };
    if (req.user.role === "REFERENT_REGION") {
      filter.contactRegion = req.user.region;
      filter.formSubjectStep1 = "QUESTION";
    }
    if (req.user.role === "REFERENT_DEPARTMENT") {
      filter.contactDepartment = { $in: req.user.departments };
      filter.formSubjectStep1 = "QUESTION";
    }
    const tickets = await TicketModel.find(filter).limit(req.cleanQuery.limit).sort({ updatedAt: -1 });
    res.status(200).send({
      ok: true,
      data: tickets,
    });
  }
);

function getDate(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

router.post("/stats/date", validateBody(SCHEMA_PERIOD), async (req: UserRequest, res: Response) => {
  const tag = await TagModel.findOne({ name: "Spam" });
  if (!tag) {
    return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Spam tag not found" });
  }
  const period = req.cleanBody.period;
  let startDate;
  if (req.cleanBody.startDate) {
    startDate = new Date(req.cleanBody.startDate);
  } else {
    startDate = getDate(new Date(), -period);
  }

  const endDate = req.cleanBody.endDate ? new Date(req.cleanBody.endDate) : new Date();

  const filter: any = {
    $or: [{ createdAt: { $gte: startDate, $lte: endDate } }, { closedAt: { $gte: startDate, $lte: endDate } }],
  };
  if (req.user.role === "REFERENT_REGION") {
    filter.contactRegion = req.user.region;
    filter.formSubjectStep1 = "QUESTION";
  }
  if (req.user.role === "REFERENT_DEPARTMENT") {
    filter.contactDepartment = { $in: req.user.departments };
    filter.formSubjectStep1 = "QUESTION";
  }
  const aggregate = await TicketModel.aggregate([
    {
      $match: filter,
    },
    {
      $project: {
        _id: 0,
        ticketsCreated: {
          $cond: [
            {
              $and: [{ $gte: ["$createdAt", startDate] }, { $lte: ["$createdAt", endDate] }],
            },
            1,
            0,
          ],
        },
        ticketsClosed: {
          $cond: [
            {
              $and: [{ $gte: ["$closedAt", startDate] }, { $lte: ["$closedAt", endDate] }],
            },
            1,
            0,
          ],
        },
        spam: { $cond: [{ $in: [tag._id.toString(), "$tagsId"] }, 1, 0] },
      },
    },
    {
      $project: {
        ticketsCreated: 1,
        ticketsClosed: 1,
        ticketsCreatedSpam: { $cond: [{ $and: ["$ticketsCreated", "$spam"] }, 1, 0] },
        ticketsClosedSpam: { $cond: [{ $and: ["$ticketsClosed", "$spam"] }, 1, 0] },
      },
    },
    {
      $group: {
        _id: null,
        ticketsCreated: { $sum: "$ticketsCreated" },
        ticketsClosed: { $sum: "$ticketsClosed" },
        ticketsCreatedSpam: { $sum: "$ticketsCreatedSpam" },
        ticketsClosedSpam: { $sum: "$ticketsClosedSpam" },
      },
    },
  ]);
  if (aggregate.length === 0) {
    const data = {
      ticketsCreated: 0,
      ticketsClosed: 0,
      ticketsCreatedSpam: 0,
      ticketsClosedSpam: 0,
    };
    return res.status(200).send({ ok: true, data });
  }
  const { _id, ...data } = aggregate[0];
  return res.status(200).send({ ok: true, data });
});

router.post(
  "/stats/tags",
  validateQuery(
    Joi.object({
      source: Joi.string().valid("dashboard"),
    })
  ),
  validateBody(SCHEMA_PERIOD),
  async (req: UserRequest, res: Response) => {
    const period = req.cleanBody.period;

    let startDate;
    let startDate2;
    if (req.cleanBody.startDate) {
      startDate = new Date(req.cleanBody.startDate);
      // start date 2 is 2 times the difference between start date and today
      startDate2 = new Date(startDate);
      startDate2.setDate(startDate2.getDate() - (new Date().getDate() - startDate.getDate()) * 2);
    } else {
      startDate = getDate(new Date(), -period);
      startDate2 = getDate(new Date(), -period * 2);
    }
    const endDate = req.cleanBody.endDate ? new Date(req.cleanBody.endDate) : new Date();

    const spamTag = await TagModel.findOne({ name: "Spam" });
    if (!spamTag) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Spam tag not found" });
    }

    const filter: any = {
      createdAt: { $gte: startDate2, $lte: endDate },
      tagsId: { $ne: spamTag._id.toString() },
    };
    if (req.user.role === "REFERENT_REGION") {
      filter.contactRegion = req.user.region;
      filter.formSubjectStep1 = "QUESTION";
    }
    if (req.user.role === "REFERENT_DEPARTMENT") {
      filter.contactDepartment = { $in: req.user.departments };
      filter.formSubjectStep1 = "QUESTION";
    }
    const aggregate = await TicketModel.aggregate([
      {
        $match: filter,
      },
      {
        $project: { _id: 0, tagsId: 1, createdAt: 1 },
      },
      {
        $unwind: { path: "$tagsId", preserveNullAndEmptyArrays: false },
      },
    ]);

    const filteredTags: any = {};
    for (const item of aggregate) {
      const key = item.tagsId;
      if (!key) {
        continue;
      }
      if (!filteredTags[key]) {
        filteredTags[key] = {
          _id: key,
          count: 0,
          countAll: 0,
        };
      }
      filteredTags[key].countAll += 1;
      if (item.createdAt >= startDate) {
        filteredTags[key].count += 1;
      }
    }

    const tags: any = await TagModel.find({
      _id: { $in: Object.keys(filteredTags) },
      name: { $ne: null },
    }).select(["_id", "name"]);

    for (const tag of tags) {
      const key = tag._id.toString();
      filteredTags[key].name = tag.name;
    }

    for (const key in filteredTags) {
      const tag = filteredTags[key];
      tag.percentage = tag.countAll - tag.count !== 0 ? (tag.count / (tag.countAll - tag.count) - 1) * 100 : 0;
    }

    const data = Object.values(filteredTags)
      .filter((i: any) => i.count && i.name)
      .map((i: any) => ({
        key: i._id,
        doc_count: i.count,
        percentage: i.percentage,
        name: i.name,
      }))
      .sort((a, b) => b.doc_count - a.doc_count)
      .slice(0, req.cleanQuery.source === "dashboard" ? 12 : 20);

    return res.status(200).send({ ok: true, data });
  }
);

router.post("/stats/source", validateBody(SCHEMA_PERIOD), async (req: UserRequest, res: Response) => {
  const tag = await TagModel.findOne({ name: "Spam" });
  if (!tag) {
    return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND, message: "Spam tag not found" });
  }
  const period = req.cleanBody.period;
  let startDate;
  if (req.cleanBody.startDate) {
    startDate = new Date(req.cleanBody.startDate);
  } else {
    startDate = getDate(new Date(), -period);
  }
  const endDate = req.cleanBody.endDate ? new Date(req.cleanBody.endDate) : new Date();

  const filter: any = { createdAt: { $gte: startDate, $lte: endDate } };
  if (req.user.role === "REFERENT_REGION") {
    filter.contactRegion = req.user.region;
    filter.formSubjectStep1 = "QUESTION";
  }
  if (req.user.role === "REFERENT_DEPARTMENT") {
    filter.contactDepartment = { $in: req.user.departments };
    filter.formSubjectStep1 = "QUESTION";
  }
  const sourceAggregate = await TicketModel.aggregate([
    {
      $match: filter,
    },
    {
      $group: { _id: "$source", count: { $sum: 1 } },
    },
  ]);
  const spamAggregate = await TicketModel.aggregate([
    {
      $match: {
        ...filter,
        tagsId: tag._id.toString(),
        source: "MAIL",
      },
    },
    {
      $count: "mailSpam",
    },
  ]);
  return res.status(200).send({ ok: true, data: { mailSpam: spamAggregate.length ? spamAggregate[0].mailSpam : 0, sources: sourceAggregate } });
});

router.post("/stats/feedback", validateBody(SCHEMA_PERIOD), async (req: UserRequest, res: Response) => {
  const period = req.cleanBody.period || 7;
  let startDate;
  if (req.cleanBody.startDate) {
    startDate = new Date(req.cleanBody.startDate);
  } else {
    startDate = getDate(new Date(), -period);
  }
  const endDate = req.cleanBody.endDate ? new Date(req.cleanBody.endDate) : new Date();

  const filter: any = { createdAt: { $gte: startDate, $lte: endDate } };
  if (req.user.role === "REFERENT_REGION") {
    filter.contactRegion = req.user.region;
    filter.formSubjectStep1 = "QUESTION";
  }
  if (req.user.role === "REFERENT_DEPARTMENT") {
    filter.contactDepartment = { $in: req.user.departments };
    filter.formSubjectStep1 = "QUESTION";
  }
  const aggregate = await TicketModel.aggregate([
    {
      $match: filter,
    },
    {
      $group: { _id: "$feedback", count: { $sum: 1 } },
    },
  ]);
  return res.status(200).send({ ok: true, data: aggregate });
});

router.get("/:id", validateParams(idSchema), async (req: UserRequest, res: Response) => {
  const ticket = await TicketModel.findById(req.cleanParams.id);
  if (!ticket) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
  const tags = await TagModel.find({ _id: { $in: ticket.tagsId }, deletedAt: null });
  return res.status(200).send({ ok: true, data: { ticket, tags } });
});

router.get("/linkTicket/:id", validateParams(idSchema), async (req: UserRequest, res: Response) => {
  let query: any = { contactId: req.cleanParams.id };
  if (req.user.role === "REFERENT_DEPARTMENT" || req.user.role === "REFERENT_REGION") {
    query.formSubjectStep1 = "QUESTION";
  }
  const ticket = await TicketModel.find(query);
  return res.status(200).send({ ok: true, data: ticket });
});

router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(
    Joi.object({
      subject: Joi.string().trim(),
      contactEmail: SCHEMA_EMAIL,
      canal: Joi.string().valid("MAIL", "PLATFORM"),
      tagsId: Joi.array().items(SCHEMA_ID),
      copyRecipients: Joi.array().items(SCHEMA_EMAIL),
      files: Joi.array().items(Joi.object()),
      status: SCHEMA_TICKET_STATUS,
      messageDraft: Joi.string().allow(""),
      feedback: Joi.string().trim(),
      contactGroup: SCHEMA_CONTACT_GROUP,
      contactDepartment: Joi.string().trim(),
      contactAttributes: Joi.array().items(
        Joi.object({
          name: Joi.string(),
          value: Joi.string().allow(null),
          format: Joi.string().valid("string", "date", "link"),
        })
      ),
      notes: Joi.array().items(
        Joi.object({
          authorName: Joi.string().trim(),
          createdAt: Joi.date(),
          content: Joi.string(),
        })
      ),
      agentId: SCHEMA_ID.allow(""),
      agentFirstName: Joi.string().allow("").trim(),
      agentLastName: Joi.string().allow("").trim(),
      agentEmail: Joi.string().allow("").trim(),
      referentDepartmentId: SCHEMA_ID,
      referentDepartmentFirstName: Joi.string().trim(),
      referentDepartmentLastName: Joi.string().trim(),
      referentDepartmentEmail: Joi.string().trim(),
      referentRegionId: SCHEMA_ID,
      referentRegionFirstName: Joi.string().trim(),
      referentRegionLastName: Joi.string().trim(),
      referentRegionEmail: Joi.string().trim(),
      formSubjectStep1: Joi.string().valid("TECHNICAL", "QUESTION"),
    }).min(1)
  ),
  async (req: UserRequest, res: Response) => {
    const id = req.cleanParams.id;

    let ticket = await TicketModel.findOne({ _id: id });
    if (!ticket) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    ticket.set(req.cleanBody);

    if (req.cleanBody.status === "CLOSED") {
      ticket.closedAt = new Date();
      if (!ticket.closedTimeHours) ticket.closedTimeHours = Number(Number(getHoursDifference(new Date(), ticket.createdAt)).toFixed(2));
    }

    // TODO : updated logic & schema

    // if (req.cleanBody.folder) {
    //   ticket.folder = req.cleanBody.folder;
    //   ticket.folders = [req.cleanBody.folder];
    // }
    // if (Object.prototype.hasOwnProperty.call(req.cleanBody, "folderId")) {
    //   ticket.foldersId.push(req.cleanBody.folderId);
    // }

    if (req.cleanBody.messageDraft) {
      ticket.status = "DRAFT";
    }

    if (req.cleanBody.subject) {
      if (req.cleanBody.subject.includes("question")) ticket.formSubjectStep1 = "QUESTION";
      if (req.cleanBody.subject.includes("problème")) ticket.formSubjectStep1 = "TECHNICAL";
    }

    ticket.lastUpdateAgent = req.user._id;
    ticket.updatedAt = new Date();

    ["agentId", "agentFirstName", "agentLastName", "agentEmail"].forEach((field) => {
      if (req.cleanBody[field] === "") {
        ticket![field] = undefined;
      }
    });

    const tags = await TagModel.find({ _id: { $in: ticket.tagsId }, deletedAt: null });
    ticket.tags = tags.map((tag) => tag.name);
    ticket = await matchVentilationRule(ticket);

    // Sauvegarde des changements finaux
    await ticket!.save();
    return res.status(200).send({ ok: true, data: { ticket, tags } });
  }
);

router.delete("/:id", validateParams(idSchema), async (req: UserRequest, res: Response) => {
  const id = req.cleanParams.id;
  await TicketModel.findOneAndDelete({ _id: id });
  return res.status(200).send({ ok: true });
});

router.put(
  "/transfer/:id",
  validateParams(idSchema),
  validateBody(
    Joi.object({
      contactEmail: SCHEMA_EMAIL,
    }).prefs({ presence: "required" })
  ),
  async (req: UserRequest, res: Response) => {
    const id = req.cleanParams.id;
    let ticket = await TicketModel.findById(id);
    if (!ticket) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    await sendEmailWithConditions({ ticket, dest: req.cleanBody.contactEmail, messageHistory: "all", copyRecipient: null, attachment: null, lastMessageId: null });
    const agent = await AgentModel.findById(req.user._id);
    if (!agent) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    ticket.notes.push({
      content: `Ticket transféré le ${Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(Date.now())}`,
      authorName: agent.firstName + " " + agent.lastName + " à " + req.cleanBody.contactEmail,
      createdAt: new Date(),
    });
    await ticket.save();
    return res.status(200).send({ ok: true });
  }
);

router.put(
  "/viewing/:id",
  validateParams(idSchema),
  validateBody(
    Joi.object({
      isViewing: Joi.boolean(),
    }).prefs({ presence: "required" })
  ),
  async (req: UserRequest, res: Response) => {
    const id = req.cleanParams.id;
    let ticket = await TicketModel.findById(id);
    if (!ticket) return res.status(400).send({ ok: false, code: ERRORS.WRONG_REQUEST });
    ticket.viewingAgent = req.cleanBody.isViewing
      ? [...new Set([...ticket.viewingAgent, { email: req.user.email, lastName: req.user.lastName, firstName: req.user.firstName, role: req.user.role }])]
      : ticket.viewingAgent.filter((agent) => agent.email !== req.user.email);
    await ticket.save();
    return res.status(200).send({ ok: true });
  }
);

router.get("/viewing/:id", validateParams(idSchema), async (req: UserRequest, res: Response) => {
  const id = req.cleanParams.id;
  let ticket = await TicketModel.findById(id);
  if (!ticket) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
  return res.status(200).send({ ok: true, data: ticket.viewingAgent });
});

/*
Routes deleted as not used :
POST /ticket/aggregate
*/

module.exports = router;
