const fetch = require("node-fetch");

const { SENDINBLUEKEY } = require("./config");
const { capture } = require("./sentry");

const SENDER_NAME = "Service National Universel";
const SENDER_EMAIL = "contact@snu.gouv.fr";

//https://my.sendinblue.com/lists/add-attributes

const api = async (path, options = {}) => {
  if (!SENDINBLUEKEY) return console.log("NOT SENDINBLUE KEY");

  const res = await fetch(`https://api.sendinblue.com/v3${path}`, {
    ...options,
    headers: { "api-key": SENDINBLUEKEY, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const contentType = res.headers.raw()["content-type"];
  if (contentType && contentType.length && contentType[0].includes("application/json")) return await res.json();
  return await res.text();
};

// https://developers.sendinblue.com/reference#sendtransacemail
async function sendEmail(to, subject, htmlContent, { params, attachment } = {}) {
  try {
    const body = {};

    body.to = [to];
    body.htmlContent = htmlContent;
    body.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
    body.subject = subject;

    if (params) body.params = params;
    if (attachment) body.attachment = attachment;
    const a = await api("/smtp/email", { method: "POST", body: JSON.stringify(body) });
    console.log("e", a);
  } catch (e) {
    console.log("Erreur in sendEmail", e);
    capture(e);
  }
}

// https://developers.sendinblue.com/reference#sendtransacemail
async function sendTemplate(id, { params, emailTo, attachment } = {}) {
  const body = { to: emailTo.map((email) => ({ email })), templateId: id };
  if (params) body.params = params;
  if (attachment) body.attachment = attachment;
  return await api("/smtp/email", { method: "POST", body: JSON.stringify(body) });
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

async function sync(obj, type) {
  // if (process.env.NODE_ENV !== "production") return;
  try {
    const user = JSON.parse(JSON.stringify(obj));
    if (!user) return console.log("ERROR WITH ", obj);

    const email = user.email;

    const attributes = {};
    for (let i = 0; i < Object.keys(user).length; i++) {
      const key = Object.keys(user)[i];
      if (key.indexOf("At") !== -1) {
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

    let listIds = attributes.TYPE === "YOUNG" ? [46] : [47];

    delete attributes.EMAIL;
    delete attributes.PASSWORD;
    delete attributes.__V;
    delete attributes._ID;
    delete attributes.LASTNAME;
    delete attributes.FIRSTNAME;

    const ok = await updateContact(email, { attributes, listIds });
    if (!ok) {
      await createContact({ email, attributes, listIds });
    }
  } catch (e) {
    console.log("error", e);
  }
}

async function unsync(obj) {
  try {
    await deleteContact(obj.email);
  } catch (e) {
    console.log("Can't delete in sendinblue", obj.email);
  }
}

module.exports = { sync, unsync, sendEmail, sendTemplate, createContact, updateContact, deleteContact };
