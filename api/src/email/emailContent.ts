/**
 * Assainissement du contenu des mails transactionnels renvoyé par Brevo
 * (audit API 2026-09-21, constat C12 : « Ne jamais renvoyer le body Brevo brut »).
 *
 * Les mails de la plateforme embarquent les secrets dans leurs paramètres : lien de
 * réinitialisation (`?token=<forgotPasswordResetToken>`), code 2FA à six chiffres,
 * token d'invitation référent, tokens des représentants légaux, token de contrat…
 * Restituer le corps rendu revient donc à distribuer ces secrets à tout utilisateur
 * autorisé sur l'onglet Notifications — y compris dans son propre périmètre.
 *
 * Deux niveaux :
 *  1. les mails d'authentification (2FA, mot de passe oublié, validation d'adresse,
 *     invitation) n'ont AUCUN contenu restitué : leur corps *est* le secret ;
 *  2. pour tous les autres, les valeurs des paramètres sensibles présentes dans le
 *     corps sont masquées, ce qui couvre la longue traîne des liens porteurs de token.
 */
import sanitizeHtml from "sanitize-html";
import { SENDINBLUE_TEMPLATES } from "snu-lib";

/** Templates dont le contenu est un secret d'authentification à part entière. */
const AUTH_TEMPLATE_IDS = new Set<string>(
  [
    SENDINBLUE_TEMPLATES.SIGNIN_2FA,
    SENDINBLUE_TEMPLATES.SIGNUP_EMAIL_VALIDATION,
    SENDINBLUE_TEMPLATES.PROFILE_EMAIL_VALIDATION,
    SENDINBLUE_TEMPLATES.FORGOT_PASSWORD,
    SENDINBLUE_TEMPLATES.INVITATION_YOUNG,
    ...Object.values(SENDINBLUE_TEMPLATES.invitationReferent),
  ].map(String),
);

const SENSITIVE_PARAM_REGEX = /([?&](?:token|token2fa|code|key|apikey|secret)=)[^"'&\s<>]+/gi;

export const REDACTED = "[masqué]";

export function isAuthTemplate(templateId?: string | null): boolean {
  return !!templateId && AUTH_TEMPLATE_IDS.has(String(templateId));
}

export function maskSecrets(body?: string | null): string | null {
  if (!body) return body ?? null;
  return body.replace(SENSITIVE_PARAM_REGEX, `$1${REDACTED}`);
}

/**
 * Liste blanche du balisage d'un mail restitué dans l'admin (audit fronts 2026-09-23, FM9).
 * Le corps vient de Brevo, mais les paramètres qui y sont injectés (message de désistement,
 * nom de mission…) sont saisis par des volontaires et des responsables. On garde la mise en
 * page d'un mail (tableaux, styles en ligne, images) et on retire scripts, gestionnaires
 * d'événements, formulaires et cadres ; les liens ne gardent que des schémas web.
 */
const EMAIL_BODY_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "center", "font", "span"],
  allowedAttributes: {
    "*": ["style", "class", "align", "valign", "width", "height", "bgcolor", "border", "cellpadding", "cellspacing", "color", "dir", "lang"],
    a: ["href", "name", "title", "target", "rel"],
    img: ["src", "alt", "title"],
    font: ["face", "size"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
};

export function sanitizeEmailBody(body?: string | null): string | null {
  if (!body) return body ?? null;
  return sanitizeHtml(body, EMAIL_BODY_SANITIZE_OPTIONS);
}

export interface SerializedEmailContent {
  subject?: string;
  date?: string;
  events?: unknown;
  body: string | null;
  /** true quand le corps a été retiré parce que le mail est un mail d'authentification. */
  contentRedacted: boolean;
}

/**
 * Liste blanche des champs renvoyés au front (le front n'utilise que `events` et `body`),
 * plus masquage des secrets et assainissement du balisage. On ne relaie jamais la réponse Brevo telle quelle.
 */
export function serializeEmailContent(emailData: any, templateId?: string | null): SerializedEmailContent {
  const contentRedacted = isAuthTemplate(templateId);
  return {
    subject: emailData?.subject,
    date: emailData?.date,
    events: emailData?.events,
    body: contentRedacted ? null : sanitizeEmailBody(maskSecrets(emailData?.body)),
    contentRedacted,
  };
}
