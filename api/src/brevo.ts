import fs from "fs";
import fetch from "node-fetch";
import queryString from "querystring";
import config from "config";

import { SENDINBLUE_TEMPLATES, YOUNG_STATUS, ROLES } from "snu-lib";

import { capture, captureMessage } from "./sentry";
import { rateLimiterContactSIB } from "./rateLimiters";
import { sendMailCatcher } from "./mailcatcher";

const SENDER_NAME = "Service National Universel";
const SENDER_NAME_SMS = "SNU";
const SENDER_EMAIL = "no_reply-mailauto@snu.gouv.fr";

//https://my.sendinblue.com/lists/add-attributes

type ContactAttribute = {
  FIRSTNAME: string;
  PRENOM: string;
  NOM: string;
  LASTNAME: string;
  TYPE: string;
  REGISTRED: boolean;
  REGISTRED_AT: string;
  EMAIL: string;
  PASSWORD: string;
  __V: string;
  _ID: string;
};

type Contact = {
  email: string;
  attributes?: object;
  emailBlacklisted?: boolean;
  smsBlacklisted?: boolean;
  listIds?: number[];
  listId?: number;
  updateEnabled?: boolean;
  smtpBlacklistSender?: string[];
  unlinkListIds?: number[];
};

type Email = {
  email: string;
  name?: string;
};

const api = async (path, options: any = {}, force?: boolean) => {
  try {
    if (!config.ENABLE_SENDINBLUE && !force) return console.log("No mail sent as ENABLE_SENDINBLUE is disabled");

    if (!config.SENDINBLUEKEY) {
      console.log("NO SENDINBLUE KEY");
      console.log(options);
      return console.log("Mail was not sent.");
    }

    const res = await fetch(`https://api.sendinblue.com/v3${path}`, {
      ...options,
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      headers: { "api-key": config.SENDINBLUEKEY, "Content-Type": "application/json", ...(options.headers || {}) },
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
export async function sendSMS(phoneNumber, content, tag) {
  try {
    // format phone number for Sendinblue
    const formattedPhoneNumber = phoneNumber
      .replace(/[^0-9]/g, "")
      .replace(/^0([6,7])/, "33$1")
      .replace(/^330/, "33");

    const body: any = {};
    body.sender = SENDER_NAME_SMS;
    body.recipient = formattedPhoneNumber;
    body.content = content;
    body.type = "transactional";
    body.tag = tag;

    const sms = await api("/transactionalSMS/sms", { method: "POST", body: JSON.stringify(body) });
    if (!sms || sms?.code) {
      captureMessage("Error sending an SMS", { extra: { sms, body } });
    }
    if (config.ENVIRONMENT !== "production") {
      console.log(body, sms);
    }
  } catch (e) {
    console.log("Erreur in sendSMS", e);
    capture(e);
  }
}

// https://developers.sendinblue.com/reference#sendtransacemail
export async function sendEmail(to: Email[], subject: string, htmlContent, { params, attachment, cc, bcc }: Omit<SendMailParameters, "emailTo"> = {}) {
  try {
    if (config.get("MAIL_TRANSPORT") === "SMTP") {
      await sendMailCatcher(subject, htmlContent, { emailTo: to, cc, bcc, attachment });
      return;
    }

    if (config.get("MAIL_TRANSPORT") !== "BREVO") {
      return;
    }

    const body: any = {};
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
    if (config.ENVIRONMENT !== "production") {
      console.log(body, mail);
    }
  } catch (e) {
    console.log("Erreur in sendEmail", e);
    capture(e);
  }
}

export async function getEmailsList({ email, templateId, messageId, startDate, endDate, sort, limit, offset }: any = {}) {
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

export async function getEmailContent(uuid) {
  try {
    return await api(`/smtp/emails/${uuid}`, { method: "GET" });
  } catch (e) {
    console.log("Erreur in getEmail", e);
    capture(e);
  }
}

interface BrevoEmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  createdAt: string;
  modifiedAt: string;
  doiTemplate: boolean;
}

function replaceTemplateParams(content: string, params: SendMailParameters["params"] = {}) {
  let hydratedContent = content;
  for (const paramKey of Object.keys(params)) {
    hydratedContent = hydratedContent.replace(new RegExp(`{{ *params.${paramKey} *}}`, "g"), String(params[paramKey]));
  }
  return hydratedContent;
}

async function simulateTemplate(id: string, { params, emailTo, cc, bcc, attachment }: SendMailParameters) {
  if (!config.SENDINBLUEKEY) return null;
  const template: BrevoEmailTemplate = await api(`/smtp/templates/${id}`, undefined, true);
  const subject = replaceTemplateParams(template.subject, params);
  const html = replaceTemplateParams(template.htmlContent, params);
  if (config.SMTP_PORT && config.SMTP_HOST) {
    await sendMailCatcher(subject, html, {
      emailTo,
      cc,
      bcc,
      attachment,
    });
  } else {
    fs.writeFileSync(`${new Date().toISOString()}-${id}.email.html`, `<!-- EMAIL (${id}) TO ${emailTo?.map(({ email }) => email).join(",")}. SUBJECT: ${subject} -->` + html);
  }
}

export type SendMailParameters = {
  emailTo: Email[];
  cc?: Email[];
  bcc?: Email[];
  attachment?: Array<{ content: string; name: string }>;
  params?: {
    [key: string]: string | string[] | number | undefined;
  };
};

interface SendTemplateOptions {
  force?: boolean;
}

// https://developers.sendinblue.com/reference#sendtransacemail
export async function sendTemplate(id: string, { params, emailTo, cc, bcc, attachment }: SendMailParameters, options: SendTemplateOptions = {}) {
  try {
    if (!id) throw new Error("No template id provided");

    if (!options.force && config.get("MAIL_TRANSPORT") === "SMTP") {
      await simulateTemplate(id, { params, emailTo, cc, bcc, attachment });
      return;
    }
    if (!options.force && config.get("MAIL_TRANSPORT") !== "BREVO") {
      return;
    }
    const body: any = { templateId: parseInt(id) };
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
    if (config.ENVIRONMENT !== "production" || options.force) {
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
export async function createContact({ email, attributes, emailBlacklisted, smsBlacklisted, listIds, updateEnabled, smtpBlacklistSender }: Partial<Contact> = {}) {
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
export async function deleteContact(id) {
  const identifier = typeof id === "string" ? encodeURIComponent(id) : id;
  return await api(`/contacts/${identifier}`, { method: "DELETE" });
}

/**
 * https://developers.sendinblue.com/reference#deletecontact
 * @param id {string|number} Email (urlencoded) OR ID of the contact
 * @returns {Promise<void>}
 */
export async function getContact(id) {
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
export async function updateContact(id, { attributes, emailBlacklisted, smsBlacklisted, listIds, unlinkListIds, smtpBlacklistSender }: Partial<Contact> = {}) {
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

export async function sync(obj, type, { force } = { force: false }) {
  if (config.ENVIRONMENT !== "production" && !force) return console.log("no sync brevo");
  try {
    const user = JSON.parse(JSON.stringify(obj));
    if (!user) return console.log("ERROR WITH ", obj);

    const email = user.email;
    let parents: Contact[] = [];
    const attributes: Partial<ContactAttribute> = {};
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

    let listIds: number[] = [];
    if (attributes.TYPE === "YOUNG") {
      if (user.status === YOUNG_STATUS.DELETED) return;
      if (user.parent1Email) {
        parents.push({ email: user.parent1Email, attributes, listIds: [1447] });
      }
      if (user.parent2Email) {
        parents.push({ email: user.parent2Email, attributes, listIds: [1447] });
      }
      listIds.push(1446);
    }
    if (attributes.TYPE === "REFERENT") listIds.push(1448);
    [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) && listIds.push(1243);
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && listIds.push(1449);

    delete attributes.EMAIL;
    delete attributes.PASSWORD;
    delete attributes.__V;
    delete attributes._ID;
    delete attributes.LASTNAME;
    delete attributes.FIRSTNAME;

    syncContact(email, attributes, listIds);
    for (const parent of parents) {
      syncContact(parent.email, parent.attributes, parent.listIds!);
    }
  } catch (e) {
    console.log("error", e);
    capture(e);
  }
}

export async function syncContact(email: string, attributes, listIds: number[]) {
  try {
    const res = await rateLimiterContactSIB.call(() => createContact({ email, attributes, listIds, updateEnabled: true }));
    if (!res || res?.code) throw new Error(JSON.stringify({ res, email, attributes, listIds }));
    return;
  } catch (e) {
    capture(e);
  }
}

export async function unsync(obj, options = { force: false }) {
  if (config.ENVIRONMENT !== "production" && !options.force) {
    console.log("no unsync brevo");
    return;
  }

  const emails = [obj.parent1Email, obj.parent2Email, obj.email].filter(Boolean);

  try {
    await Promise.all(emails.map(deleteContact));
  } catch (error) {
    console.log("Can't delete in brevo", emails);
    capture(error);
  }
}
