const IMAP = require("imap");
const cron = require("node-cron");
const { simpleParser } = require("mailparser");
// const { uploadToS3FromBuffer, getSignedUrl } = require("./s3");
// const { getValueFromKey } = require("../utils");
const { config } = require("./config");
const TicketModel = require("./models/ticket");
const MessageModel = require("./models/message");
const ContactModel = require("./models/contact");
const OrganisationModel = require("./models/organisation");
const { matchVentilationRule } = require("./utils/ventilation");
const { uploadAttachment, weekday } = require("./utils");
const { weekendRanges, isDateInRange } = require("./utils/email");
const { sendTemplate } = require("./brevo");
const { capture } = require("./sentry");
const { sendNotif, SENDINBLUE_TEMPLATES } = require("./utils/");
const { encrypt } = require("./utils/crypto");
const { getS3Path } = require("./utils/file");

const regex = /\[#(\w+)\]/i;

cron.schedule("*/30 * * * *", () => {
  try {
    if (config.ENVIRONMENT === "production" || config.ENVIRONMENT === "staging") {
      Module.fetch();
    }
  } catch (e) {
    console.log("fail fetch mail");
    capture(e);
  }
});

async function addMessage(mail) {
  try {
    // create contact if it doesnt exist yet
    let contact = await ContactModel.findOne({ email: mail.fromAddress.toLowerCase() });
    if (!contact) contact = await ContactModel.create({ firstName: mail.fromName, lastName: "", email: mail.fromAddress.toLowerCase() });

    let ticket = null;

    //check if message exists
    const isMessage = await MessageModel.findOne({ messageId: mail.messageId });
    if (isMessage) return;

    // check if first mail from pile of mails exists to find ticket
    if (mail.references.length) {
      const firstMessageId = mail.references[0];
      const firstMessage = await MessageModel.findOne({ messageId: firstMessageId });
      if (firstMessage) {
        ticket = await TicketModel.findOne({ _id: firstMessage.ticketId });
        if (!ticket) console.log("no ticket found, message" + firstMessage);
      }
    }

    //check if ticket exists with subject regex
    if (mail.ticketNumber && !ticket) {
      ticket = await TicketModel.findOne({ number: mail.ticketNumber });
    }

    if (ticket) ticket.status = "OPEN";
    //Create ticket if it doesnt exist yet
    if (!ticket) {
      const lastTicket = await TicketModel.find().sort({ number: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(1);
      const obj = {};
      obj.subject = mail.subject;
      obj.source = "MAIL";
      obj.messageCount = 0;
      obj.contactId = contact._id;
      obj.contactFirstName = contact.firstName;
      obj.contactLastName = contact.lastName;
      obj.contactEmail = contact.email;
      obj.number = Number(lastTicket[0].number) + 1;
      obj.status = "NEW";
      obj.canal = "MAIL";
      obj.contactGroup = contact?.attributes?.find((a) => a.name === "role")?.value || "unknown";
      obj.contactDepartment = contact.attributes?.find((att) => att?.name === "departement")?.value;
      obj.contactCohort = contact.attributes?.find((att) => att?.name === "cohorte")?.value;
      obj.contactRegion = contact.attributes?.find((att) => att?.name === "region")?.value;
      obj.contactAttributes = contact?.attributes;
      obj.imapEmail = mail?.toAdress === "inscription@mail-support.snu.gouv.fr" ? "inscription@mail-support.snu.gouv.fr" : "contact@mail-support.snu.gouv.fr";
      obj.createdHourAt = new Date().getHours();
      obj.createdDayAt = weekday[new Date().getDay()];

      if (mail.copyRecipient) obj.copyRecipient = mail.copyRecipient;
      ticket = await TicketModel.create(obj);
      ticket = await matchVentilationRule(ticket);
      await sendNotif({ ticket, templateId: SENDINBLUE_TEMPLATES.MESSAGE_RECEIVED, message: mail.text, attachment: [] });
    }

    // create message
    const message = {};
    message.messageId = mail.messageId;
    message.text = mail.html ?? "";
    message.ticketId = ticket._id;
    message.authorFirstName = contact.firstName;
    message.authorLastName = contact.lastName;
    message.authorId = contact._id;
    message.rawText = mail.text;
    message.rawHtml = mail.textHtml;
    message.fromEmail = contact.email;
    message.toEmail = mail.toAdress;
    message.subject = mail.subject;
    if (mail.copyRecipient) message.copyRecipient = mail.copyRecipient;
    let createdMessage = await MessageModel.create(message);

    if (mail.attachments?.length) {
      createdMessage.files = [];
      for (let attachment of mail.attachments) {
        if (
          attachment.contentType.includes("image") ||
          attachment.contentType.includes("pdf") ||
          attachment.contentType.includes("xls") ||
          attachment.contentType.includes("application/vnd.ms-excel") ||
          attachment.contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
          attachment.contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
          attachment.contentType.includes("application/vnd.oasis.opendocument.spreadsheet") ||
          attachment.contentType.includes("application/vnd.oasis.opendocument.text") ||
          attachment.contentType.includes("application/vnd.oasis.opendocument.presentation") ||
          attachment.filename?.includes("doc")
        ) {
          const encryptedBuffer = encrypt(attachment.content);
          const path = getS3Path(attachment.filename);
          const url = await uploadAttachment(path, { data: encryptedBuffer, mimetype: attachment.contentType, encoding: "7bit" });
          if (url) {
            createdMessage.files.push({ name: attachment.filename, path, url });
          }
        }
      }
      await createdMessage.save();
    }

    //udpate ticket
    ticket.messageCount = ticket.messageCount + 1;
    ticket.updatedAt = new Date();
    await ticket.save();

    if (isDateInRange(new Date(), weekendRanges)) {
      const templateId = SENDINBLUE_TEMPLATES.SNUPPORT_CLOSED;
      await sendTemplate(templateId, {
        emailTo: [{ email: contact.email }],
      });
    }
  } catch (e) {
    console.log("error fetching mail : ", mail);
    capture(e);
  }
}

const Module = {
  async fetch() {
    try {
      const organisation = await OrganisationModel.findOne({ name: "SNU" });
      console.log("fetch");
      const imapArray = organisation.imapConfig;
      for (let i = 0; i < imapArray.length; i++) {
        imapArray[i].keepalive = false;

        console.log(formatMailDate(imapArray[i].lastFetch));
        let search = ["ALL", ["SINCE", formatMailDate(imapArray[i].lastFetch)]];
        const lastFetch = imapArray[i].lastFetch;
        let messages = await readMails(imapArray[i], "INBOX", search);
        //   messages = messages.filter((message) => message.date.getTime() > step.last_fetch_at.getTime());
        for (let message of messages) {
          if (message.subject) {
            const messageData = extractMailData(message);
            if (!organisation.spamEmails.includes(messageData.fromAddress)) await addMessage(messageData, lastFetch);
          }
        }

        imapArray[i].lastFetch = new Date();
      }
      organisation.set({ imapConfig: imapArray });
      await organisation.save();
    } catch (e) {
      console.log("error fetching mail");
      capture(e);
    }
  },
};

function formatMailDate(date = new Date()) {
  date = new Date(date.getTime());
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  return `${monthNames[date.getMonth()]} ${date.getDate() < 10 ? "0" : ""}${date.getDate()}, ${date.getFullYear()}`;
}

function extractMailData(message) {
  const data = {};
  if (message.subject.match(regex)) data.ticketNumber = message.subject.match(regex)[1];
  data.subject = message.subject;
  data.text = message.text;
  //data.textAsHtml = message.textAsHtml;
  data.html = message.html !== "false" && message.html !== false && message.html !== null ? message.html : message.text;
  data.textHtml = message.textHtml;
  data.text = message.text;
  data.references = message.references || [];
  data.fromName = message.from.value[0]?.name;
  data.fromAddress = message.from.value[0].address;

  data.messageId = message.messageId;
  data.inReplyTo = message.inReplyTo;

  data.attachments = message.attachments;

  data.toName = message.to?.value[0]?.name;
  data.toAdress = message.to?.value[0].address;
  data.date = message.date;
  data.copyRecipient = message.cc?.value?.map((recipient) => recipient.address);
  if (data.copyRecipient === undefined) data.copyRecipient = [];
  data.copyRecipient = data.copyRecipient.concat(message.to?.value?.map((recipient) => recipient.address).filter((recipient) => recipient !== "contact@mail-support.snu.gouv.fr"));
  return data;
}

// async function uploadAttachmentsToS3(attachments) {
//   const result = [];

//   for (let attachment of attachments) {
//     const buffer = attachment.content;
//     const contentType = attachment.contentType;
//     const filename = attachment.filename;
//     const filepath = `download/${filename}`;
//     if (!filename) continue;

//     await uploadToS3FromBuffer(filepath, buffer, contentType);
//     const file = getSignedUrl(filepath);
//     result.push({
//       filename,
//       file,
//     });
//   }

//   return result;
// }

function readMails(imapConfig, box, searchs = []) {
  try {
    return new Promise((resolve) => {
      const imap = new IMAP(imapConfig);
      imap.once("ready", () => {
        imap.openBox(box, true, (err) => {
          if (err) return console.error(err);

          imap.search(searchs, (err, results) => {
            if (!results || !results.length) return resolve([]);

            const fetchResults = imap.fetch(results, { bodies: "", struct: true });
            const messages = [];

            // fetch messages:
            fetchResults.on("message", (message, seqno) => {
              const messageObj = { message, seqno };
              let headers, body;
              // fetch and parse message headers
              message.on("body", async (stream) => {
                let buffer = "";
                stream.on("data", (chunk) => {
                  buffer += chunk.toString("utf8");
                });
                stream.once("end", () => {
                  body = buffer.toString("utf8");
                });
              });
              message.once("end", () => {
                messageObj.headers = headers;
                messageObj.body = body;
                messages.push(messageObj);
              });
            });

            fetchResults.once("end", async () => {
              const promises = messages.map((message) => {
                return simpleParser(message.body);
              });
              const mails = await Promise.all(promises);
              imap.closeBox(() => {
                // imap.destroy();
                imap.end();
              });
              resolve(mails);
            });
          });
        });
      });

      imap.once("error", (err) => {
        console.log("Unable to connect to IMAP, address: " + imap._config.user);
        console.log(err);
        imap.destroy();
      });

      imap.connect();
    });
  } catch (e) {
    capture(e);
  }
}
module.exports = Module;
