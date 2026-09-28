const express = require("express");
const Joi = require("joi");
const { apiKeyGuard } = require("../../middlewares/authenticationGuards");
const { validateBody, validateQuery } = require("../../middlewares/validation");
const router = express.Router();
const MessageModel = require("../../models/message");
const TicketModel = require("../../models/ticket");
const ContactModel = require("../../models/contact");
const AgentModel = require("../../models/agent");
const { matchVentilationRule } = require("../../utils/ventilation");
const { weekday, sendNotif, SENDINBLUE_TEMPLATES } = require("../../utils");
const { weekendRanges, isDateInRange } = require("../../utils/email");
const { SCHEMA_ID, SCHEMA_EMAIL, SCHEMA_PARCOURS, SCHEMA_SOURCE, SCHEMA_ATTACHMENT_PATH } = require("../../schemas");
const { plainTextToMessageHtml } = require("../../utils/messageHtml");
const { serializeTicketForContact, serializeMessageForContact } = require("../../utils/contactTicketSerializer");
const { resolveUnverifiedContact } = require("../../utils/contactVerification");

const { sendTemplate } = require("../../brevo");

const WRONG_REQUEST = "WRONG_REQUEST";
const OPERATION_UNAUTHORIZED = "OPERATION_UNAUTHORIZED";

router.use(apiKeyGuard);

router.post(
  "/",
  validateBody(
    Joi.object({
      message: Joi.string().max(20000),
      email: SCHEMA_EMAIL,
      firstName: Joi.string(),
      lastName: Joi.string(),
      attributes: Joi.array().items(
        Joi.object({
          name: Joi.string(),
          value: Joi.alternatives().try(Joi.string().allow("", null), Joi.array().items(Joi.string())).optional(),
        })
      ),
      files: Joi.array()
        .items(
          Joi.object({
            name: Joi.string(),
            url: Joi.string(),
            // Le chemin est contraint au préfixe des pièces jointes de message : l'api v1 vérifie déjà
            // que l'objet vient d'un upload support, ce filtre est la seconde barrière côté support.
            path: SCHEMA_ATTACHMENT_PATH,
          })
        )
        .optional(),
      subject: Joi.string().optional(),
      source: SCHEMA_SOURCE.optional(),
      parcours: SCHEMA_PARCOURS.optional(),
      author: Joi.string().valid("young", "parent", "admin", "admin exterior").optional(),
      ticketId: SCHEMA_ID.optional(),
      formSubjectStep1: Joi.string().optional(),
      formSubjectStep2: Joi.string().optional(),
    }).prefs({ presence: "required" })
  ),
  async (req, res) => {
    const { subject, message, source, email, firstName, lastName, ticketId, attributes, author, formSubjectStep1, formSubjectStep2, files, parcours } = req.cleanBody;
    const valuesForMail = ["young exterior", "admin exterior", "administrateur_cle", "referent_classe"];

    const organisation = req.user;

    const flatAttributes = (arr) => arr.map((e) => e.name);
    const filterAttributes = flatAttributes(attributes).map((e) => {
      if (flatAttributes(organisation.attributes).includes(e)) {
        return { name: e, value: attributes.find((att) => att.name === e).value, format: organisation.attributes.find((att) => att.name === e).format };
      }
      return null;
    });
    const contactGroupAttribute = filterAttributes.find((att) => att.name === "role");

    if (Array.isArray(filterAttributes.find((att) => att.name === "departement").value)) {
      filterAttributes.find((att) => att.name === "departement").value = filterAttributes.find((att) => att.name === "departement").value[0];
    }

    // Le formulaire public (source FORM) n'authentifie pas l'email saisi : il ne doit jamais réécrire la
    // fiche d'un contact existant, ni rejoindre un ticket existant (M91). Les autres appels viennent de
    // routes authentifiées de l'api v1, qui transmettent l'identité de la session.
    const isAnonymousForm = source === "FORM";
    // Texte brut saisi dans un formulaire : échappé puis mis en forme, jamais concaténé tel quel (M92).
    const formatedMessage = plainTextToMessageHtml(message);
    if (isAnonymousForm && ticketId) return res.status(403).send({ ok: false, code: OPERATION_UNAUTHORIZED });

    // PM46 : le formulaire public n'authentifie jamais l'email saisi. On ne réécrit ni ne remplace
    // la fiche existante, et si elle appartient déjà à un contact connu (référent, admin, jeune),
    // le ticket créé plus bas est marqué "identité non vérifiée" (identityVerified=false).
    let user;
    let identityVerified = true;
    if (isAnonymousForm) {
      ({ identity: user, identityVerified } = await resolveUnverifiedContact({
        ContactModel,
        AgentModel,
        email,
        createAttrs: { firstName, lastName, attributes: filterAttributes },
      }));
    } else {
      user = await ContactModel.findOneAndUpdate({ email: email.toLowerCase() }, { email: email.toLowerCase(), firstName, lastName, attributes: filterAttributes });
      if (!user) user = await AgentModel.findOne({ email: email.toLowerCase() });
      if (!user) user = await ContactModel.create({ email: email.toLowerCase(), firstName, lastName, attributes: filterAttributes });
    }

    let ticket = ticketId ? await TicketModel.findById(ticketId) : null;
    // Un message n'est ajouté qu'au ticket de son auteur : l'api v1 le vérifie déjà, c'est la seconde barrière.
    if (ticket && String(ticket.contactId) !== String(user._id)) return res.status(403).send({ ok: false, code: OPERATION_UNAUTHORIZED });
    if (ticket) {
      ticket.status = "OPEN";
      ticket.messageCount = ticket.messageCount + 1 || 2;
      ticket.textMessage.push(message);
    }
    const lastTicket = await TicketModel.find().sort({ number: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(1);

    if (!ticket) {
      ticket = await TicketModel.create({
        number: Number(lastTicket[0].number) + 1,
        contactId: user._id,
        contactLastName: user.lastName,
        contactFirstName: user.firstName,
        contactEmail: user.email,
        contactAttributes: filterAttributes,
        contactGroup: contactGroupAttribute?.value || "unknown",
        contactDepartment: filterAttributes?.find((att) => att?.name === "departement")?.value,
        contactCohort: filterAttributes?.find((att) => att?.name === "cohorte")?.value,
        contactRegion: filterAttributes?.find((att) => att?.name === "region")?.value,
        source,
        status: "NEW",
        subject,
        author,
        parcours,
        formSubjectStep1: subject.includes("question") ? "QUESTION" : formSubjectStep1,
        formSubjectStep2,
        canal: valuesForMail.includes(contactGroupAttribute?.value) ? "MAIL" : "PLATFORM",
        textMessage: [message],
        createdHourAt: new Date().getHours(),
        createdDayAt: weekday[new Date().getDay()],
        identityVerified,
      });

      ticket = await matchVentilationRule(ticket);

      // PM52 : le formulaire public n'est jamais authentifié — l'accusé de réception officiel ne
      // doit plus recopier le texte choisi par l'expéditeur.
      await sendNotif({ ticket, templateId: SENDINBLUE_TEMPLATES.MESSAGE_RECEIVED, message: isAnonymousForm ? undefined : formatedMessage });

      if (isDateInRange(new Date(), weekendRanges)) {
        const templateId = SENDINBLUE_TEMPLATES.SNUPPORT_CLOSED;
        await sendTemplate(templateId, {
          emailTo: [{ email: user.email }],
        });
      }
    }
    if (!ticket) return res.status(400).send({ ok: false, code: WRONG_REQUEST });

    ticket.updatedAt = new Date();

    await ticket.save();

    const newMessage = await MessageModel.create({
      ticketId: ticket._id,
      authorId: user._id,
      authorLastName: user.lastName,
      authorFirstName: user.firstName,
      text: formatedMessage,
      // Seuls le nom et le chemin (préfixe `message/`, vérifié par Joi) sont conservés : l'URL fournie
      // par l'appelant n'est lue par aucun front et pouvait pointer n'importe où.
      files: files?.map(({ name, path }) => ({ name, path })),
    });

    if (!newMessage) return res.status(400).send({ ok: false, code: WRONG_REQUEST });

    return res.status(200).send({ ok: true, data: { ticket: serializeTicketForContact(ticket), message: serializeMessageForContact(newMessage) } });
  }
);

/*
Routes deleted as not used :
GET /v0/message
*/

module.exports = router;
