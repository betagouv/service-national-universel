import fs from "fs";
import fetch from "node-fetch";
import { config } from "./config";
import { logger } from "./logger";

import { capture, captureMessage } from "./sentry";
import { sendMailCatcher } from "./mailcatcher";

const SENDER_NAME = " Support Service National Universel";
const SENDER_EMAIL = "contact@mail-support.snu.gouv.fr";

type Email = {
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
    capture(e, { extra: { path, options } });
  }
};

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
