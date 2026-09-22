import fs from "fs";
import fetch from "node-fetch";
import queryString from "querystring";
import { config } from "./config";
import { logger } from "./logger";

import { SENDINBLUE_TEMPLATES, YOUNG_STATUS, ROLES } from "snu-lib";

import { capture, captureMessage } from "./sentry";
import { isSensitiveKey } from "./utils/logRedaction";
import { rateLimiterContactSIB } from "./rateLimiters";
import { sendMailCatcher } from "./mailcatcher";

const SENDER_NAME = "Service National Universel";
const SENDER_NAME_SMS = "SNU";
const SENDER_EMAIL = "no_reply-mailauto@snu.gouv.fr";

export const MAILING_LISTS = {
  INSCRIPTION: 1712,
};

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

export type Email = {
  email: string;
  name?: string;
};

const api = async (path, options: any = {}, force?: boolean) => {
  try {
    if (!config.ENABLE_SENDINBLUE && !force) {
      logger.warn("Not possible to use BREVO api as ENABLE_SENDINBLUE is disabled");
      return;
    }

    if (!config.SENDINBLUEKEY) {
      captureMessage("NO SENDINBLUE KEY");
      logger.debug(options);
      logger.debug("Mail was not sent.");
      return;
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
    // `options.body` porte le contact complet (attributs = document métier) : ne jamais l'envoyer à Sentry
    capture(e, { extra: { path, method: options.method } });
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
      logger.debug("", { body, sms });
    }
  } catch (e) {
    capture(e);
  }
}

// https://developers.sendinblue.com/reference#sendtransacemail
export async function sendEmail(to: Email[], subject: string, htmlContent, { params, attachment, cc, bcc }: Omit<SendMailParameters, "emailTo"> = {}) {
  try {
    if (config.MAIL_TRANSPORT === "SMTP") {
      await sendMailCatcher(subject, htmlContent, { emailTo: to, cc, bcc, attachment });
      return;
    }

    if (config.MAIL_TRANSPORT !== "BREVO") {
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
      logger.debug("", { body, mail });
    }
  } catch (e) {
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
    capture(e);
  }
}

export async function getEmailContent(uuid) {
  try {
    return await api(`/smtp/emails/${uuid}`, { method: "GET" });
  } catch (e) {
    capture(e);
  }
}

export interface BrevoEmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  createdAt: string;
  modifiedAt: string;
  doiTemplate: boolean;
}

export interface BrevoApiError {
  code: string;
  message: string;
}

export const BREVO_ERROR_TEMPLATE_NOT_FOUND = "document_not_found";

function replaceTemplateParams(content: string, params: SendMailParameters["params"] = {}) {
  let hydratedContent = content;
  for (const paramKey of Object.keys(params)) {
    hydratedContent = hydratedContent?.replace(new RegExp(`{{ *params.${paramKey} *}}`, "g"), String(params[paramKey]));
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

/**
 * getPreviewTemplate
 *
 * @param id template id
 * @returns
 */
export async function getPreviewTemplate(id: string) {
  if (!config.SENDINBLUEKEY) {
    captureMessage("NO SENDINBLUE KEY");
  }
  const template: BrevoEmailTemplate | BrevoApiError = await api(`/smtp/templates/${id}`, undefined, true);

  if ((template as BrevoApiError).code === BREVO_ERROR_TEMPLATE_NOT_FOUND) {
    captureMessage("NO TEMPLATE FOUND");
  }

  return template;
}

export type SendMailParameters = {
  emailTo: Email[];
  cc?: Email[];
  bcc?: Email[];
  attachment?: Array<{ content: string; name: string }>;
  params?: {
    [key: string]: string | string[] | number | null | undefined;
  };
};

interface SendTemplateOptions {
  force?: boolean;
}

// https://developers.sendinblue.com/reference#sendtransacemail
export async function sendTemplate(id: string, { params, emailTo, cc, bcc, attachment }: SendMailParameters, options: SendTemplateOptions = {}) {
  try {
    if (!id) throw new Error("No template id provided");

    if (!options.force && config.MAIL_TRANSPORT === "SMTP") {
      await simulateTemplate(id, { params, emailTo, cc, bcc, attachment });
      return;
    }
    if (!options.force && config.MAIL_TRANSPORT !== "BREVO") {
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
      logger.debug("", { body, mail });
    }
    return mail;
  } catch (e) {
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

/**
 * Attributs de contact synchronisés vers Brevo.
 *
 * Liste explicite (allowlist) et non liste d'exclusion : le document jeune porte plus de 300 champs, dont
 * des données de santé (handicap, allergies, PAI/PPS, structure médico-sociale, aménagements spécifiques,
 * PSC1, dossier médical), l'adresse précise, le téléphone, la date de naissance, les pièces d'identité et
 * les coordonnées des deux représentants légaux. Brevo est un sous-traitant marketing : il ne doit recevoir
 * que ce qui sert au ciblage et à la personnalisation des campagnes.
 *
 * Une liste d'exclusion laissait passer par défaut tout nouveau champ du schéma. Ici, un champ non listé
 * n'est jamais transmis : l'ajout doit être délibéré et vérifié au regard de la finalité marketing.
 */
const YOUNG_SYNC_FIELDS = [
  "cohort",
  "cohortId",
  "originalCohort",
  "source",
  "status",
  "accountStatus",
  "phase",
  "statusPhase1",
  "statusPhase2",
  "statusPhase3",
  "phase2ApplicationStatus",
  "phase2NumberHoursDone",
  "inscriptionStep",
  "inscriptionStep2023",
  "hasStartedReinscription",
  "withdrawnReason",
  "grade",
  "situation",
  "schooled",
  "academy",
  "department",
  "region",
  "country",
  "qpv",
  "isRegionRural",
  "populationDensity",
  "createdAt",
  "updatedAt",
  "lastStatusAt",
  "inscriptionDoneDate",
  "statusPhase2ValidatedAt",
  "statusPhase3ValidatedAt",
  "lastLoginAt",
  "lastActivityAt",
] as const;

const REFERENT_SYNC_FIELDS = [
  "role",
  "subRole",
  "invitationType",
  "status",
  "region",
  "department",
  "cohesionCenterName",
  "acceptCGU",
  "registredAt",
  "createdAt",
  "updatedAt",
  "lastLoginAt",
  "lastActivityAt",
] as const;

/**
 * Attributs transmis au contact d'un représentant légal : uniquement le contexte de campagne du jeune.
 * Le parent ne reçoit ni les données de santé du jeune, ni son adresse, son téléphone ou sa date de
 * naissance, ni les coordonnées de l'autre représentant légal.
 */
const PARENT_SYNC_FIELDS = [
  "cohort",
  "cohortId",
  "source",
  "status",
  "phase",
  "statusPhase1",
  "statusPhase2",
  "statusPhase3",
  "inscriptionStep2023",
  "grade",
  "academy",
  "department",
  "region",
  "createdAt",
  "updatedAt",
  "lastStatusAt",
] as const;

function buildAttributes(user, fields: readonly string[]): Partial<ContactAttribute> {
  const attributes: Partial<ContactAttribute> = {};
  for (const field of fields) {
    // filet de sécurité : une clé sensible ne peut pas entrer dans Brevo par une entrée erronée de la liste
    if (isSensitiveKey(field)) continue;
    const value = user[field];
    if (value === undefined || value === null || value === "") continue;
    // si c'est une date, on ne garde que le jour
    attributes[field.toUpperCase()] = field.endsWith("At") && typeof value === "string" ? value.slice(0, 10) : value;
  }
  return attributes;
}

export async function sync(obj, type, { force } = { force: false }) {
  if (config.ENVIRONMENT !== "production" && !force) {
    logger.debug("no sync brevo");
    return;
  }
  try {
    const user = JSON.parse(JSON.stringify(obj));
    if (!user) throw new Error("NO USER TO SYNC");

    const email = user.email;
    const id = user._id;
    const contactType = String(type).toUpperCase();

    const attributes = buildAttributes(user, contactType === "YOUNG" ? YOUNG_SYNC_FIELDS : REFERENT_SYNC_FIELDS);
    user.firstName && (attributes.PRENOM = user.firstName);
    user.lastName && (attributes.NOM = user.lastName);
    attributes.TYPE = contactType;
    attributes.REGISTRED = !!attributes.REGISTRED_AT;

    let parents: { slot: "parent1" | "parent2"; contact: Contact }[] = [];
    let listIds: number[] = [];
    if (contactType === "YOUNG") {
      if (user.status === YOUNG_STATUS.DELETED) return;
      // le contact parent est identifié par le jeune (prénom, nom, cohorte) : les campagnes parents s'y appuient
      const parentAttributes = buildAttributes(user, PARENT_SYNC_FIELDS);
      parentAttributes.PRENOM = attributes.PRENOM;
      parentAttributes.NOM = attributes.NOM;
      parentAttributes.TYPE = attributes.TYPE;
      parentAttributes.REGISTRED = attributes.REGISTRED;
      if (user.parent1Email) {
        parents.push({ slot: "parent1", contact: { email: user.parent1Email, attributes: parentAttributes, listIds: [1447] } });
      }
      if (user.parent2Email) {
        parents.push({ slot: "parent2", contact: { email: user.parent2Email, attributes: parentAttributes, listIds: [1447] } });
      }
      listIds.push(1446);
    }
    if (contactType === "REFERENT") listIds.push(1448);
    [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) && listIds.push(1243, 2225);
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && listIds.push(1449);

    syncContact(email, attributes, listIds, { id, type: contactType, contact: "self" });
    for (const parent of parents) {
      syncContact(parent.contact.email, parent.contact.attributes, parent.contact.listIds!, { id, type: contactType, contact: parent.slot });
    }
  } catch (e) {
    capture(e);
  }
}

/** Identifie le contact synchronisé sans donnée personnelle : _id du document, type et emplacement (self / parent1 / parent2) */
export type SyncContactContext = { id?: string; type?: string; contact?: "self" | "parent1" | "parent2" };

export async function syncContact(email: string, attributes, listIds: number[], context: SyncContactContext = {}) {
  let res;
  try {
    res = await rateLimiterContactSIB.call(() => createContact({ email, attributes, listIds, updateEnabled: true }));
    if (!res || res?.code) {
      // Ne jamais inclure `email` ni `attributes` ici : attributes contient le document complet (tokens, PII)
      // et ce message finit dans les logs applicatifs.
      const brevoError = res ? `${res.code} - ${res.message ?? ""}` : "no response";
      const who = `type=${context.type ?? "?"} id=${context.id ?? "?"} contact=${context.contact ?? "?"}`;
      throw new Error(`Brevo contact sync failed (${who}, listIds=[${listIds.join(",")}]): ${brevoError}`);
    }
    return;
  } catch (e) {
    capture(e, { extra: { ...context, listIds, brevoResponse: res } });
  }
}

export async function unsync(obj, options = { force: false }) {
  if (config.ENVIRONMENT !== "production" && !options.force) {
    logger.debug("no unsync brevo");
    return;
  }

  const emails = [obj.parent1Email, obj.parent2Email, obj.email].filter(Boolean);

  try {
    await Promise.all(emails.map(deleteContact));
  } catch (error) {
    capture(error, { contexts: { emails } });
  }
}
