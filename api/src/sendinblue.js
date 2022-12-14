const { captureMessage } = require("@sentry/node");
const fetch = require("node-fetch");

const { SENDINBLUEKEY, ENVIRONMENT } = require("./config");
const { capture } = require("./sentry");

const SENDER_NAME = "Service National Universel";
const SENDER_NAME_SMS = "SNU";
const SENDER_EMAIL = "no_reply-mailauto@snu.gouv.fr";

//https://my.sendinblue.com/lists/add-attributes

const api = async (path, options = {}) => {
  if (!SENDINBLUEKEY) {
    console.log("NO SENDINBLUE KEY");
    console.log(options);
    return console.log("Mail was not sent.");
  }

  const res = await fetch(`https://api.sendinblue.com/v3${path}`, {
    ...options,
    headers: { "api-key": SENDINBLUEKEY, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  const contentType = res.headers.raw()["content-type"];
  if (contentType && contentType.length && contentType[0].includes("application/json")) return await res.json();
  return await res.text();
};

// https://developers.sendinblue.com/reference/sendtransacsms
async function sendSMS(phoneNumber, content, tag) {
  try {
    // format phone number for Sendinblue
    const formattedPhoneNumber = phoneNumber
      .replace(/[^0-9]/g, "")
      .replace(/^0([6,7])/, "33$1")
      .replace(/330/, "33");

    const body = {};
    body.sender = SENDER_NAME_SMS;
    body.recipient = formattedPhoneNumber;
    body.content = content;
    body.type = "transactional";
    body.tag = tag;

    const sms = await api("/transactionalSMS/sms", { method: "POST", body: JSON.stringify(body) });
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
      const regexp = /(selego\.co|(beta|education|jeunesse-sports)\.gouv\.fr|fr\.ey\.com)/;
      to = to.filter((e) => e.email.match(regexp));
      if (cc?.length) cc = cc.filter((e) => e.email.match(regexp));
      if (bcc?.length) bcc = bcc.filter((e) => e.email.match(regexp));
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
    if (ENVIRONMENT !== "production") {
      console.log(body, mail);
    }
  } catch (e) {
    console.log("Erreur in sendEmail", e);
    capture(e);
  }
}

// https://developers.sendinblue.com/reference#sendtransacemail
async function sendTemplate(id, { params, emailTo, cc, bcc, attachment } = {}, { force } = { force: false }) {
  try {
    const body = { templateId: parseInt(id) };
    if (!force && ENVIRONMENT !== "production") {
      console.log("emailTo before filter:", emailTo);
      const regexp = /(selego\.co|(beta|education|jeunesse-sports)\.gouv\.fr|fr\.ey\.com)/;
      emailTo = emailTo.filter((e) => e.email.match(regexp));
      if (cc?.length) cc = cc.filter((e) => e.email.match(regexp));
      if (bcc?.length) bcc = bcc.filter((e) => e.email.match(regexp));
    }
    if (emailTo) body.to = emailTo;
    if (cc?.length) body.cc = cc;
    if (bcc?.length) body.bcc = bcc;
    if (params) body.params = params;
    if (attachment) body.attachment = attachment;
    const mail = await api("/smtp/email", { method: "POST", body: JSON.stringify(body) });
    if (ENVIRONMENT !== "production") {
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
  const res = await api("/contacts", { method: "POST", body: JSON.stringify(body) });
  return res;
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

  const res = await api(`/contacts/${identifier}`, { method: "PUT", body: JSON.stringify(body) });
  if (res && res.code) return false;
  return true;
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
  }
}

async function syncContact(email, attributes, listIds) {
  try {
    try {
      await updateContact(email, { attributes, listIds });
    } catch (e) {
      captureMessage("Contact not found during update, creating new contact:" + email);
      await createContact({ email, attributes, listIds });
    }
  } catch (e) {
    capture(e);
  }
}

async function unsync(obj) {
  try {
    if (obj.hasOwnProperty("parent1Email") && obj.parent1Email) {
      await deleteContact(obj.parent1Email);
    }
    if (obj.hasOwnProperty("parent2Email") && obj.parent2Email) {
      await deleteContact(obj.parent2Email);
    }

    await deleteContact(obj.email);
  } catch (e) {
    console.log("Can't delete in sendinblue", obj.email);
  }
}

module.exports = { api, sync, unsync, sendSMS, sendEmail, sendTemplate, createContact, updateContact, deleteContact, getContact };
