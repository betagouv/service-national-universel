const fetch = require("node-fetch");
const queryString = require("querystring");

const { SENDINBLUEKEY, ENVIRONMENT } = require("./config");
const { capture, captureMessage } = require("./sentry");
const { SENDINBLUE_TEMPLATES, YOUNG_STATUS } = require("snu-lib");
const { rateLimiterContactSIB } = require("./rateLimiters");

const SENDER_NAME = "Service National Universel";
const SENDER_NAME_SMS = "SNU";
const SENDER_EMAIL = "no_reply-mailauto@snu.gouv.fr";

//https://my.sendinblue.com/lists/add-attributes

const regexp_exception_staging = /selego\.co|(beta|education|jeunesse-sports|snu)\.gouv\.fr|lexfo\.fr/;

const api = async (path, options = {}) => {
  try {
    if (!SENDINBLUEKEY) {
      console.log("NO SENDINBLUE KEY");
      console.log(options);
      return console.log("Mail was not sent.");
    }

    const res = await fetch(`https://api.sendinblue.com/v3${path}`, {
      ...options,
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      headers: { "api-key": SENDINBLUEKEY, "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const contentType = res.headers.raw()["content-type"];
    if (contentType && contentType.length && contentType[0].includes("application/json")) return await res.json();
    // Sometimes, sendinblue returns a 204 with an empty body
    return true;
  } catch (e) {
    console.log("Erreur in sendinblue api", e);
    capture(e, { extra: { path, options } });
  }
};

// https://developers.sendinblue.com/reference/sendtransacsms
async function sendSMS(phoneNumber, content, tag) {
  try {
    // format phone number for Sendinblue
    const formattedPhoneNumber = phoneNumber
      .replace(/[^0-9]/g, "")
      .replace(/^0([6,7])/, "33$1")
      .replace(/^330/, "33");

    const body = {};
    body.sender = SENDER_NAME_SMS;
    body.recipient = formattedPhoneNumber;
    body.content = content;
    body.type = "transactional";
    body.tag = tag;

    const sms = await api("/transactionalSMS/sms", { method: "POST", body: JSON.stringify(body) });
    if (!sms || sms?.code) {
      captureMessage("Error sending an SMS", { extra: { sms, body } });
    }
    if (ENVIRONMENT !== "production") {
      console.log(body, sms);
    }
  } catch (e) {
    console.log("Erreur in sendSMS", e);
    capture(e);
  }
}

// https://developers.sendinblue.com/reference#sendtransacemail
async function sendEmail(to, subject, htmlContent, { params, attachment, cc, bcc } = {}) {
  try {
    const body = {};
    if (ENVIRONMENT !== "production") {
      console.log("to before filter:", to);
      to = to.filter((e) => e.email.match(regexp_exception_staging));
      if (cc?.length) cc = cc.filter((e) => e.email.match(regexp_exception_staging));
      if (bcc?.length) bcc = bcc.filter((e) => e.email.match(regexp_exception_staging));
    }
    body.to = [to];
    if (cc?.length) body.cc = cc;
    if (bcc?.length) body.bcc = bcc;
    body.htmlContent = htmlContent;
    body.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
    body.subject = subject;

    if (params) body.params = params;
    if (attachment) body.attachment = attachment;
    const mail = await api("/smtp/email", { method: "POST", body: JSON.stringify(body) });
    if (!mail || mail?.code) {
      captureMessage("Error sending an email", { extra: { mail, body } });
    }
    if (ENVIRONMENT !== "production") {
      console.log(body, mail);
    }
  } catch (e) {
    console.log("Erreur in sendEmail", e);
    capture(e);
  }
}

async function getEmailsList({ email, templateId, messageId, startDate, endDate, sort, limit, offset } = {}) {
  try {
    const body = {
      email,
      templateId,
      messageId,
      startDate,
      endDate,
      sort,
      limit,
      offset,
    };
    const filteredBody = Object.entries(body)
      .filter(([, value]) => value !== undefined)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    return await api(`/smtp/emails?${queryString.stringify(filteredBody)}`, { method: "GET" });
  } catch (e) {
    console.log("Erreur in getEmail", e);
    capture(e);
  }
}

async function getEmailContent(uuid) {
  try {
    return await api(`/smtp/emails/${uuid}`, { method: "GET" });
  } catch (e) {
    console.log("Erreur in getEmail", e);
    capture(e);
  }
}

// https://developers.sendinblue.com/reference#sendtransacemail
async function sendTemplate(id, { params, emailTo, cc, bcc, attachment } = {}, { force } = { force: false }) {
  try {
    if (!id) throw new Error("No template id provided");

    const body = { templateId: parseInt(id) };
    if (!force && ENVIRONMENT !== "production") {
      console.log("emailTo before filter:", emailTo);
      emailTo = emailTo.filter((e) => e.email.match(regexp_exception_staging));
      if (cc?.length) cc = cc.filter((e) => e.email.match(regexp_exception_staging));
      if (bcc?.length) bcc = bcc.filter((e) => e.email.match(regexp_exception_staging));
    }
    if (emailTo) body.to = emailTo;
    if (cc?.length) body.cc = cc;
    if (bcc?.length) body.bcc = bcc;
    if (params) body.params = params;
    if (attachment) body.attachment = attachment;
    const mail = await api("/smtp/email", { method: "POST", body: JSON.stringify(body) });

    // * To delete once we put the email of the parent in the template
    const isParentTemplate = Object.values(SENDINBLUE_TEMPLATES.parent).some((value) => value == body?.templateId);
    if (mail?.message == "email is missing in to" && isParentTemplate) {
      captureMessage("Parent sans email", { extra: { mail, body } });
      return;
    }

    if (!mail || mail?.code) {
      captureMessage("Error sending a template", { extra: { mail, body } });
      return;
    }
    if (ENVIRONMENT !== "production" || force) {
      console.log(body, mail);
    }
    return mail;
  } catch (e) {
    console.log("Erreur in sendTemplate", e);
    capture(e);
  }
}

/**
 * https://api.sendinblue.com/v3/contacts
 * @param email {string}
 * @param attributes {object}
 * @param emailBlacklisted {boolean}
 * @param smsBlacklisted {boolean}
 * @param listIds {integer[]}
 * @param updateEnabled {boolean}
 * @param smtpBlacklistSender {string[]}
 * @returns {Promise<void>}
 */
async function createContact({ email, attributes, emailBlacklisted, smsBlacklisted, listIds, updateEnabled, smtpBlacklistSender } = {}) {
  const body = {
    email,
    attributes,
    emailBlacklisted,
    smsBlacklisted,
    listIds,
    updateEnabled,
    smtpBlacklistSender,
  };
  return await api("/contacts", { method: "POST", body: JSON.stringify(body) });
}

/**
 * https://developers.sendinblue.com/reference#deletecontact
 * @param id {string|number} Email (urlencoded) OR ID of the contact
 * @returns {Promise<void>}
 */
async function deleteContact(id) {
  const identifier = typeof id === "string" ? encodeURIComponent(id) : id;
  return await api(`/contacts/${identifier}`, { method: "DELETE" });
}

/**
 * https://developers.sendinblue.com/reference#deletecontact
 * @param id {string|number} Email (urlencoded) OR ID of the contact
 * @returns {Promise<void>}
 */
async function getContact(id) {
  const identifier = typeof id === "string" ? encodeURIComponent(id) : id;
  return await api(`/contacts/${identifier}`, { method: "GET" });
}

/**
 * https://developers.sendinblue.com/reference#updatecontact
 * @param id {string|number} Email (urlencoded) OR ID of the contact
 * @param attributes {object}
 * @param emailBlacklisted {boolean}
 * @param smsBlacklisted {boolean}
 * @param listIds {integer[]}
 * @param unlinkListIds {integer[]}
 * @param smtpBlacklistSender {string[]}
 * @returns {Promise<void>}
 */
async function updateContact(id, { attributes, emailBlacklisted, smsBlacklisted, listIds, unlinkListIds, smtpBlacklistSender } = {}) {
  const identifier = typeof id === "string" ? encodeURIComponent(id) : id;

  const body = {
    attributes,
    emailBlacklisted,
    smsBlacklisted,
    listIds,
    unlinkListIds,
    smtpBlacklistSender,
  };

  return await api(`/contacts/${identifier}`, { method: "PUT", body: JSON.stringify(body) });
}

async function sync(obj, type, { force } = { force: false }) {
  if (ENVIRONMENT !== "production" && !force) return console.log("no sync sendinblue");
  try {
    const user = JSON.parse(JSON.stringify(obj));
    if (!user) return console.log("ERROR WITH ", obj);

    const email = user.email;
    let parents = [];
    const attributes = {};
    for (let i = 0; i < Object.keys(user).length; i++) {
      const key = Object.keys(user)[i];
      if (key.endsWith("At")) {
        // if its a date
        if (user[key]) attributes[key.toUpperCase()] = user[key].slice(0, 10);
      } else {
        attributes[key.toUpperCase()] = user[key];
      }
    }

    attributes.FIRSTNAME && (attributes.PRENOM = attributes.FIRSTNAME);
    attributes.LASTNAME && (attributes.NOM = attributes.LASTNAME);
    attributes.TYPE = type.toUpperCase();
    attributes.REGISTRED = !!attributes.REGISTRED_AT;

    let listIds = [];
    if (attributes.TYPE === "YOUNG") {
      if (user.status === YOUNG_STATUS.DELETED) return;
      if (user.parent1Email) {
        parents.push({ email: user.parent1Email, attributes, listId: [185] });
      }
      if (user.parent2Email) {
        parents.push({ email: user.parent2Email, attributes, listId: [185] });
      }
      listIds.push(46);
    }
    if (attributes.TYPE === "REFERENT") listIds.push(47);
    user.statusPhase1 === "WAITING_ACCEPTATION" && listIds.push(106);
    ["referent_region", "referent_department"].includes(user.role) && listIds.push(147);
    user.role === "supervisor" && listIds.push(1049);

    delete attributes.EMAIL;
    delete attributes.PASSWORD;
    delete attributes.__V;
    delete attributes._ID;
    delete attributes.LASTNAME;
    delete attributes.FIRSTNAME;

    syncContact(email, attributes, listIds);
    for (const parent of parents) {
      syncContact(parent.email, parent.attributes, parent.listId);
    }
  } catch (e) {
    console.log("error", e);
    capture(e);
  }
}

async function syncContact(email, attributes, listIds) {
  try {
    const res = await rateLimiterContactSIB.call(() => createContact({ email, attributes, listIds, updateEnabled: true }));
    if (!res || res?.code) throw new Error(JSON.stringify({ res, email, attributes, listIds }));
    return;
  } catch (e) {
    capture(e);
  }
}

async function unsync(obj, options = { force: false }) {
  if (ENVIRONMENT !== "production" && !options.force) {
    console.log("no unsync sendinblue");
    return;
  }

  const emails = [obj.parent1Email, obj.parent2Email, obj.email].filter(Boolean);

  try {
    await Promise.all(emails.map(deleteContact));
  } catch (error) {
    console.log("Can't delete in sendinblue", emails);
    capture(error);
  }
}

module.exports = {
  regexp_exception_staging,
  api,
  sync,
  unsync,
  sendSMS,
  sendEmail,
  getEmailsList,
  getEmailContent,
  sendTemplate,
  createContact,
  updateContact,
  deleteContact,
  getContact,
};
