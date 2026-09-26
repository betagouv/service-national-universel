const AWS = require("aws-sdk");
const { validatePassword } = require("./password");
const MessageModel = require("../models/message");
const AgentModel = require("../models/agent");
const ContactModel = require("../models/contact");
const TicketModel = require("../models/ticket");
const cron = require("node-cron");
const { decrypt } = require("../utils/crypto");
const { sanitizeMessageHtml } = require("./messageHtml");

const { sendEmail, sendTemplate } = require("../brevo");

const { config } = require("../config");
const { capture } = require("../sentry");

cron.schedule("*/30 * * * *", () => {
  try {
    updateTicketAgentViewings();
  } catch (e) {
    capture(e);
  }
});

const SENDINBLUE_TEMPLATES = {
  ANSWER_RECEIVED: "1278",
  NEW_TICKET: "1254",
  MESSAGE_RECEIVED: "1255",
  TICKET_REPORT: "1386",
  SNUPPORT_CLOSED: "2416",
};

const sendResponseTicket = async ({ ticket, copyRecipient, dest, attachment, messageHistory, lastMessageId }) => {
  try {
    if (ticket.canal === "PLATFORM") {
      if (dest === ticket.contactEmail && copyRecipient.length === 0) {
        const lastMessage = ticket.textMessage[ticket.textMessage.length - 1].replace(/\\n/g, "<br>");
        await sendNotif({ ticket, templateId: SENDINBLUE_TEMPLATES.ANSWER_RECEIVED, message: lastMessage, attachment });
      } else {
        await sendEmailWithConditions({
          ticket,
          copyRecipient,
          dest,
          attachment,
          messageHistory,
          lastMessageId,
        });
      }
    } else if (ticket.canal === "MAIL") {
      await sendEmailWithConditions({ ticket, copyRecipient, dest, attachment, messageHistory, lastMessageId });
    }
  } catch (error) {
    capture(error);
  }
};

const sendEmailWithConditions = async ({ ticket, copyRecipient, dest, attachment, messageHistory, lastMessageId }) => {
  try {
    let mailTicket;
    let attachmentsEmail = attachment || [];
    let attachments;

    if (messageHistory === "all") {
      ({ mailMessages: mailTicket, attachments } = await getTicketHistory(ticket._id));

      await Promise.all(
        attachments.map(async (attachment) => {
          const fileData = await getFile(attachment.path, config.PUBLIC_BUCKET_NAME_SUPPORT);
          const buffer = decrypt(fileData.Body);

          attachmentsEmail.push({
            content: buffer.toString("base64"),
            name: attachment.name,
          });
        })
      );
    } else if (messageHistory !== null && messageHistory !== undefined) mailTicket = await getLastAndSpecificIdMessageFromTicket(ticket._id, lastMessageId, messageHistory);
    else mailTicket = await getLastMessageFromTicket(lastMessageId);

    const formatMessageForReading = (formattedMessage) => {
      const message = formattedMessage.replace(/\\n/g, "<br>").replace(/\\r/g, "<br>");
      return message;
    };

    const copyDest = copyRecipient?.map((recipient) => {
      return { email: recipient };
    });

    // L'historique concatène des messages stockés avant l'assainissement à l'entrée, et des noms
    // d'auteurs non échappés : on assainit le HTML final juste avant l'envoi (M92).
    await sendEmail([{ email: dest }], ticket.subject + " [#" + ticket.number + "]", sanitizeMessageHtml(formatMessageForReading(mailTicket)), {
      cc: copyDest ?? [],
      attachment: attachmentsEmail.length > 0 ? attachmentsEmail : undefined,
    });
  } catch (error) {
    capture(error);
  }
};

const sendNotif = async ({ ticket, templateId, message, attachment }) => {
  try {
    const youngRoles = ["young", "young exterior", "parent"];

    let ticketUrl = youngRoles.includes(ticket.contactGroup)
      ? `https://moncompte.snu.gouv.fr/echanges/${ticket._id}`
      : `https://admin.snu.gouv.fr/besoin-d-aide/ticket/${ticket._id}`;

    const params = { cta: ticketUrl };
    // Le message est injecté dans le template Brevo officiel : il est assaini avant l'envoi (M92).
    if (templateId === SENDINBLUE_TEMPLATES.MESSAGE_RECEIVED) {
      params.message = sanitizeMessageHtml(message);
    }
    if (templateId === SENDINBLUE_TEMPLATES.ANSWER_RECEIVED) {
      params.message = sanitizeMessageHtml(message);
    }
    await sendTemplate(templateId, {
      emailTo: [{ email: ticket.contactEmail }],
      params,
      attachment: attachment?.length > 0 ? attachment : undefined,
    });
  } catch (error) {
    capture(error);
  }
};

const sendReferentReport = async (infos, templateId) => {
  try {
    let params = {
      WAITING_PROCESSING: infos.ticketNew,
      NEW: infos.ticketOpen,
      OPENED: infos.ticketPending,
      PROCESSED_S_1a: infos.ticketDepartment,
      PROCESSED_S_1b: infos.ticketSnupport,
      DEPARTMENT: infos.department,
      PROCESSED_TIME_REFERENT: infos.timeToCloseReferent,
      PROCESSED_TIME_SUPPORT: infos.timeToCloseSupport,
    };

    for (const emailAddress of infos.refEmails) {
      await sendTemplate(templateId, {
        emailTo: [{ email: emailAddress }],
        params,
      });
    }
  } catch (error) {
    capture(error);
  }
};

const getTicketHistory = async (ticketId) => {
  try {
    let attachments;

    const messages = await MessageModel.find({ ticketId });
    attachments = messages
      .map((message) => message.files)
      .filter((files) => files.length > 0)
      .flat();

    if (!messages) return null;
    let mailMessages = "";
    mailMessages += `<strong>${messages.at(-1).authorLastName} ${messages.at(-1).authorFirstName} <${messages.at(-1).fromEmail}> <br>
    envoyé le ${messages.at(-1).createdAt.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}</strong> <br>
    ${messages.at(-1).text}`;
    for (let message of messages.reverse().slice(1, messages.length)) {
      mailMessages += `<blockquote style="border-left: 3px solid; padding: 5px 2px "> <strong>${message.authorLastName} ${message.authorFirstName} <${message.fromEmail}> <br>
      envoyé le ${message.createdAt.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })} </strong> <br>
      ${message.text}`;
    }
    messages.forEach(() => {
      mailMessages += `</blockquote>`;
    });
    return { mailMessages, attachments };
  } catch (error) {
    capture(error);
  }
};

const getLastMessageFromTicket = async (lastMessageId) => {
  try {
    const message = await MessageModel.findById(lastMessageId);
    const mailMessages = `<strong> ${message.authorFirstName} - Assistance du Service national universel (SNU) <br>
    a écrit le ${message.createdAt.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })} </strong> <br>
    ${message.text}`;
    return mailMessages;
  } catch (error) {
    capture(error);
  }
};

// Défense en profondeur (PH25) : specificMessageId est déjà vérifié appartenir au ticket par
// l'appelant (message.js), mais on le revérifie ici au cas où une future route oublierait ce
// contrôle avant d'appeler sendEmailWithConditions.
const getLastAndSpecificIdMessageFromTicket = async (ticketId, lastMessageId, specificMessageId) => {
  try {
    const specificMessage = await MessageModel.findOne({ _id: specificMessageId, ticketId });
    const lastMessage = await MessageModel.findById(lastMessageId);
    let mailMessages = "";
    mailMessages += `<strong> ${lastMessage.authorFirstName} - Assistance du Service national universel (SNU) <br>
    a écrit le ${lastMessage.createdAt.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })} </strong> <br>
    ${lastMessage.text}`;
    mailMessages += `<blockquote style="border-left: 3px solid; padding: 5px 2px "> <strong>${specificMessage.authorLastName} ${specificMessage.authorFirstName} <${
      specificMessage.fromEmail
    }> <br>
    envoyé le ${specificMessage.createdAt.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })} </strong> <br>
    ${specificMessage.text} </blockquote>`;
    return mailMessages;
  } catch (error) {
    capture(error);
  }
};

///S3\\\
function uploadPublicPicture(path, file) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT, accessKeyId: config.CELLAR_KEYID, secretAccessKey: config.CELLAR_KEYSECRET });
    const params = {
      Bucket: config.PUBLIC_BUCKET_NAME,
      Key: path,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: "public-read",
      Metadata: { "Cache-Control": "max-age=31536000" },
    };
    s3bucket.upload(params, function (err, data) {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

function uploadAttachment(path, file) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT_SUPPORT, accessKeyId: config.CELLAR_KEYID_SUPPORT, secretAccessKey: config.CELLAR_KEYSECRET_SUPPORT });
    const params = {
      Bucket: config.PUBLIC_BUCKET_NAME_SUPPORT,
      Key: path,
      Body: file.data,
      ContentType: file.mimetype,
      Metadata: { "Cache-Control": "max-age=31536000" },
    };

    s3bucket.upload(params, function (err, data) {
      if (err) return reject(`error in callback:${err}`);
      resolve(data.Location);
    });
  });
}

// `download` force le navigateur à télécharger le fichier au lieu de le rendre : une pièce
// jointe provient d'un tiers, elle ne doit jamais s'exécuter dans l'origine de l'agent.
function getSignedUrl(path, { download = false } = {}) {
  const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT_SUPPORT, accessKeyId: config.CELLAR_KEYID_SUPPORT, secretAccessKey: config.CELLAR_KEYSECRET_SUPPORT });
  const params = { Bucket: config.PUBLIC_BUCKET_NAME_SUPPORT, Key: path, Expires: 60 * 5 };
  if (download) params.ResponseContentDisposition = "attachment";
  return s3bucket.getSignedUrl("getObject", params);
}

const getFile = (path, bucket) => {
  const p = new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT_SUPPORT, accessKeyId: config.CELLAR_KEYID_SUPPORT, secretAccessKey: config.CELLAR_KEYSECRET_SUPPORT });
    const params = { Bucket: bucket || config.PUBLIC_BUCKET_NAME_SUPPORT, Key: path };
    s3bucket.getObject(params, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
  return p;
};

function deleteFile(path) {
  return new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({ endpoint: config.CELLAR_ENDPOINT_SUPPORT, accessKeyId: config.CELLAR_KEYID_SUPPORT, secretAccessKey: config.CELLAR_KEYSECRET_SUPPORT });
    const params = { Bucket: config.PUBLIC_BUCKET_NAME_SUPPORT, Key: path };
    s3bucket.deleteObject(params, (err, data) => {
      if (err) return reject(`error in callback:${err}`);
      resolve(data);
    });
  });
}

///S3\\\

const setAgent = async (ticket) => {
  try {
    const agent = await AgentModel.findById(ticket.agentId);
    ticket.agentFirstName = agent.firstName;
    ticket.agentLastName = agent.lastName;
    ticket.agentEmail = agent.email;
    return ticket;
  } catch (error) {
    capture(error);
  }
};

const setContact = async (ticket) => {
  try {
    const contact = await ContactModel.findOne({ _id: ticket.contactId });
    ticket.contactFirstName = contact.firstName;
    ticket.contactLastName = contact.lastName;
    ticket.contactEmail = contact.email;
    return ticket;
  } catch (error) {
    capture(error);
  }
};

const weekday = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const getHoursDifference = (date1, date2) => {
  const diff = date1.getTime() - date2.getTime();
  return diff / (1000 * 60 * 60);
};

async function updateTicketAgentViewings() {
  try {
    const tickets = await TicketModel.find({ viewingAgent: { $gt: [] } });
    for (let ticket of tickets) {
      ticket.viewingAgent = [];
      await ticket.save();
    }
  } catch (error) {
    capture(error);
  }
}

function diacriticSensitiveRegex(string = "") {
  return string.replace(/a/g, "[a,á,à,ä,â]").replace(/e/g, "[e,é,ë,è]").replace(/i/g, "[i,í,ï,ì]").replace(/o/g, "[o,ó,ö,ò]").replace(/u/g, "[u,ü,ú,ù]");
}
module.exports = {
  uploadPublicPicture,
  validatePassword,
  sendEmailWithConditions,
  setAgent,
  setContact,
  getSignedUrl,
  getFile,
  deleteFile,
  uploadAttachment,
  getTicketHistory,
  weekday,
  getHoursDifference,
  SENDINBLUE_TEMPLATES,
  sendNotif,
  diacriticSensitiveRegex,
  sendReferentReport,
  sendResponseTicket,
};
