const { sanitizeMessageHtml } = require("./messageHtml");

// Ce que les routes /v0 renvoient à l'api v1, qui le retransmet tel quel au jeune ou au référent
// auteur du ticket (M94). Le document brut emportait les notes internes, le brouillon de réponse de
// l'agent, les emails et noms des agents et référents, le journal de ventilation, les destinataires
// en copie. Liste blanche : seuls les champs affichés par les fronts (app, admin) et lus par l'api v1
// (propriété du ticket, compteur de tickets ouverts, notification du référent) sortent.

const TICKET_FIELDS = [
  "_id",
  "number",
  "status",
  "subject",
  "createdAt",
  "updatedAt",
  "messageCount",
  "source",
  "parcours",
  "formSubjectStep1",
  "formSubjectStep2",
  "contactEmail",
];

const pick = (doc, fields) => {
  if (!doc) return doc;
  const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return Object.fromEntries(fields.filter((field) => plain[field] !== undefined).map((field) => [field, plain[field]]));
};

const serializeAttachment = (file) => (file ? { name: file.name, path: file.path } : file);

const serializeTicketForContact = (ticket) => pick(ticket, TICKET_FIELDS);

const serializeMessageForContact = (message) => {
  if (!message) return message;
  const plain = typeof message.toObject === "function" ? message.toObject() : message;
  return {
    _id: plain._id,
    ticketId: plain.ticketId,
    authorFirstName: plain.authorFirstName,
    authorLastName: plain.authorLastName,
    createdAt: plain.createdAt,
    // Les messages déjà stockés n'ont pas été assainis à l'entrée : ils le sont à la sortie.
    text: sanitizeMessageHtml(plain.text),
    files: (plain.files || []).map(serializeAttachment),
    attachments: (plain.attachments || []).map(serializeAttachment),
  };
};

module.exports = { serializeTicketForContact, serializeMessageForContact, TICKET_FIELDS };
