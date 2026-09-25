/**
 * Redaction des secrets et des données personnelles avant écriture dans les logs.
 *
 * Trois usages :
 *  - `redactValue` / `redactLogInfo` : parcours en profondeur d'un objet (payload de requête, meta winston)
 *  - `redactString` : filet de sécurité sur un message texte (dump JSON, query string, email, message Joi)
 *  - `redactUrl` : URL de requête (secret porté par un segment de chemin ou un paramètre de route)
 *
 * Les secrets (mots de passe, tokens d'invitation / reset / 2FA / validation email, clés d'API, cookies)
 * sont remplacés par `**********`. Les emails sont tronqués (`j***@domaine.tld`), les téléphones masqués.
 * Les identifiants, codes d'erreur, statuts et dates d'expiration sont conservés pour le debug.
 *
 * Attention : ce module est un filet de sécurité **pour les secrets**, pas une garantie d'absence de PII.
 * Une donnée personnelle sans nom de clé reconnaissable (identité, adresse, santé, texte libre) passe au
 * travers : ne jamais logger un document métier ou un corps de requête complet en production.
 */

export const REDACTED = "**********";

const MAX_DEPTH = 12;

// Clés normalisées (minuscules, sans séparateurs) qui ne sont couvertes ni par la règle "token" ni par "password"/"secret"
const EXPLICIT_SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "setcookie",
  "apikey",
  "xapikey",
  "sendinbluekey",
  "accesskeyid",
  "secretaccesskey",
  "privatekey",
  "encryptionkey",
]);

// Clés génériques dont la valeur est celle d'un autre champ (détails de validation Joi : { key, label, value, invalids })
const CONTEXT_VALUE_KEYS = ["value", "invalids", "valids"];
const CONTEXT_NAME_KEYS = ["key", "label", "path"];

// Suffixes de clés qui contiennent "token"/"password"/"secret" mais désignent une date ou un compteur, pas un secret.
// Testés sur la clé brute pour ne matcher qu'à une frontière réelle (`_expires`, `token2FAExpires`) : sur la clé
// normalisée, "passwordUpdate" finirait par "date" et "passwordRepeat" par "at".
const NON_SECRET_SUFFIXES = ["expires", "at", "date", "attempts", "count"];

function normalizeKey(key: unknown): string {
  return String(key)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function hasNonSecretSuffix(key: unknown): boolean {
  const raw = String(key);
  return NON_SECRET_SUFFIXES.some((suffix) => {
    const camel = suffix[0].toUpperCase() + suffix.slice(1);
    return raw === suffix || raw.endsWith(`_${suffix}`) || raw.endsWith(`-${suffix}`) || raw.endsWith(camel);
  });
}

export function isSensitiveKey(key: unknown): boolean {
  const normalized = normalizeKey(key);
  if (!normalized) return false;
  // `token2FAExpires`, `passwordChangedAt`, `invitationExpires`… : dates et compteurs, utiles au debug
  if (hasNonSecretSuffix(key)) return false;
  if (EXPLICIT_SENSITIVE_KEYS.has(normalized)) return true;
  // suffixe (`invitationToken`) et préfixe (`token`, `token2FA`, `token_jva`, `token_ref`)
  if (normalized.endsWith("token") || normalized.startsWith("token")) return true;
  // cookies de session, une valeur par application : `jwt`, `jwt_ref`, `jwt_young` (api), `jwtzamoud` (snupport)
  if (normalized.startsWith("jwt")) return true;
  if (normalized.includes("password") || normalized.includes("passwd") || normalized.includes("secret")) return true;
  return false;
}

/** Clé qui porte une adresse email : la valeur est tronquée même si elle est invalide ou encodée (`%40`) */
export function isEmailKey(key: unknown): boolean {
  if (hasNonSecretSuffix(key)) return false;
  const normalized = normalizeKey(key);
  return normalized === "email" || normalized.endsWith("email") || normalized.startsWith("email");
}

// Clés dont la valeur est une URL : un secret peut y être porté par un segment de chemin, invisible pour `redactString`
const URL_KEYS = new Set(["url", "originalurl", "requesturl", "href", "link", "cta", "redirect", "location"]);

export function isUrlKey(key: unknown): boolean {
  return URL_KEYS.has(normalizeKey(key));
}

export function isPhoneKey(key: unknown): boolean {
  const normalized = normalizeKey(key);
  return normalized.endsWith("phone") || normalized.endsWith("mobile") || normalized === "tel" || normalized === "telephone";
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

export function maskEmail(email: string): string {
  const encoded = email.toLowerCase().lastIndexOf("%40");
  const plain = email.lastIndexOf("@");
  const at = Math.max(encoded, plain);
  if (at <= 0) return REDACTED;
  const domain = email.slice(at + (at === encoded ? 3 : 1));
  return `${email[0]}***@${domain}`;
}

// Email : parties locale et domaine bornées (RFC 5321) et début de partie locale ancré, sinon le moteur
// rebalaie la fin de chaîne depuis chaque position (coût quadratique sur un long texte sans email).
const EMAIL_REGEX = /(?<![A-Z0-9._%+-])[A-Z0-9._%+-]{1,64}(?:@|%40)[A-Z0-9.-]{1,253}\.[A-Z]{2,24}/gi;
// "clé":"valeur" ou "clé":123 dans un dump JSON
const JSON_PAIR_REGEX = /"([^"\\]{1,80})"\s*:\s*(?:"((?:[^"\\]|\\.)*)"|(-?\d+(?:\.\d+)?))/g;
// clé=valeur dans une query string ou un texte libre
const QUERY_PARAM_REGEX = /(^|[?&;,\s([{])([A-Za-z0-9_.-]{1,80})=([^&\s"'#]+)/g;
// jeton hexadécimal long dans un segment de chemin (32 caractères ou plus : au-delà d'un ObjectId mongo)
const LONG_HEX_REGEX = /^[a-f0-9]{32,}$/i;
// message de validation Joi : "password" with value "abc" fails to match…
const JOI_VALUE_REGEX = /"([A-Za-z0-9_.-]{1,80})" with value "([^"]{0,200})"/g;

export function redactString(text: string): string {
  if (!text) return text;
  return text
    .replace(JSON_PAIR_REGEX, (match, key: string, stringValue: string | undefined, numberValue: string | undefined) => {
      const value = stringValue !== undefined ? stringValue : numberValue;
      if ((isSensitiveKey(key) || isPhoneKey(key)) && !isEmpty(value)) return `"${key}":"${REDACTED}"`;
      if (isEmailKey(key) && typeof value === "string" && !isEmpty(value)) return `"${key}":"${maskEmail(value)}"`;
      return match;
    })
    .replace(JOI_VALUE_REGEX, (match, key: string) => {
      if (isSensitiveKey(key) || isPhoneKey(key)) return `"${key}" with value "${REDACTED}"`;
      return match;
    })
    .replace(QUERY_PARAM_REGEX, (match, prefix: string, key: string, value: string) => {
      if (isSensitiveKey(key) || isPhoneKey(key)) return `${prefix}${key}=${REDACTED}`;
      if (isEmailKey(key) && value) return `${prefix}${key}=${maskEmail(value)}`;
      return match;
    })
    .replace(EMAIL_REGEX, (email) => maskEmail(email));
}

/**
 * Redaction d'une URL de requête. Les secrets voyagent aussi en segment de chemin
 * (`/contract/token/<token>`, `/young/validate_phase3/<id>/<token>`), que `redactString` ne voit pas.
 *
 * @param url `req.originalUrl`
 * @param params `req.params` : les valeurs dont le NOM de paramètre est sensible sont masquées (les identifiants restent)
 */
export function redactUrl(url: string, params?: Record<string, unknown>): string {
  if (!url) return url;
  const queryStart = url.indexOf("?");
  const path = queryStart === -1 ? url : url.slice(0, queryStart);
  const query = queryStart === -1 ? "" : url.slice(queryStart);

  let safePath = path;
  if (params) {
    for (const name of Object.keys(params)) {
      const value = params[name];
      if (typeof value === "string" && value.length > 0 && (isSensitiveKey(name) || isPhoneKey(name))) {
        safePath = safePath.split(value).join(REDACTED);
      }
    }
  }

  // filet, quand `req.params` n'est pas disponible (404, erreur remontée par express) :
  //  - segment qui suit un segment au nom sensible (/token/<valeur>)
  //  - segment qui est un token hexadécimal long (randomBytes(20) = 40 caractères ; un ObjectId en fait 24)
  const segments = safePath.split("/");
  for (let i = 0; i < segments.length; i++) {
    if (!segments[i]) continue;
    if (i > 0 && isSensitiveKey(segments[i - 1])) segments[i] = REDACTED;
    else if (LONG_HEX_REGEX.test(segments[i])) segments[i] = REDACTED;
  }

  return redactString(segments.join("/") + query);
}

function redactLeafForKey(key: unknown, value: unknown): unknown {
  if (isEmpty(value)) return value;
  if (isSensitiveKey(key) || isPhoneKey(key)) return REDACTED;
  if (isEmailKey(key) && typeof value === "string") return maskEmail(value);
  if (isUrlKey(key) && typeof value === "string") return redactUrl(value);
  return undefined;
}

function isBinary(value: object): boolean {
  return (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) || ArrayBuffer.isView(value) || value instanceof ArrayBuffer;
}

/**
 * Détails de validation Joi : `{ key: "password", label: "password", value: "abc" }`.
 * La valeur sensible est portée par la clé générique `value`, invisible pour la redaction par nom.
 */
function contextNameOf(value: Record<string, unknown>): string | undefined {
  for (const nameKey of CONTEXT_NAME_KEYS) {
    const name = value[nameKey];
    if (typeof name === "string" && name) return name;
    if (Array.isArray(name) && typeof name[name.length - 1] === "string") return name[name.length - 1] as string;
  }
  return undefined;
}

function redactRecursive(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactString(value);
  if (typeof value !== "object") return value;
  if (value instanceof Date || isBinary(value)) return value;
  if (value instanceof Error) {
    return { name: value.name, message: redactString(value.message), stack: value.stack ? redactString(value.stack) : undefined };
  }
  if (seen.has(value)) return "[circular]";
  if (depth >= MAX_DEPTH) return "[depth limit]";
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item) => redactRecursive(item, depth + 1, seen));
    }
    // mongoose documents, ObjectId, etc. : on travaille sur leur représentation JSON.
    // `depth + 1` : un toJSON qui renvoie un objet lui-même porteur de toJSON bouclerait sinon sans borne.
    const plain = hasToJSON(value) ? safeToJSON(value) : value;
    if (plain !== value) return redactRecursive(plain, depth + 1, seen);
    const record = value as Record<string, unknown>;
    const contextName = contextNameOf(record);
    const maskContextValues = contextName !== undefined && (isSensitiveKey(contextName) || isPhoneKey(contextName));
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      const child = safeRead(record, key);
      if (maskContextValues && CONTEXT_VALUE_KEYS.includes(key) && !isEmpty(child)) {
        out[key] = REDACTED;
        continue;
      }
      if (contextName !== undefined && isEmailKey(contextName) && CONTEXT_VALUE_KEYS.includes(key) && !isEmpty(child)) {
        out[key] = maskEmails(child);
        continue;
      }
      const redactedLeaf = redactLeafForKey(key, child);
      out[key] = redactedLeaf !== undefined ? redactedLeaf : redactRecursive(child, depth + 1, seen);
    }
    return out;
  } finally {
    seen.delete(value);
  }
}

/** Tronque une valeur d'email, qu'elle soit une chaîne ou un tableau de chaînes (`context.invalids` de Joi) */
function maskEmails(value: unknown): unknown {
  if (typeof value === "string") return maskEmail(value);
  if (Array.isArray(value)) return value.map((item) => maskEmails(item));
  return value;
}

function safeRead(record: Record<string, unknown>, key: string): unknown {
  try {
    return record[key];
  } catch {
    return "[getter failed]";
  }
}

type WithToJSON = { toJSON: () => unknown };

function hasToJSON(value: object): value is WithToJSON {
  return typeof (value as Partial<WithToJSON>).toJSON === "function";
}

function safeToJSON(value: WithToJSON): unknown {
  try {
    return value.toJSON();
  } catch {
    return value;
  }
}

/**
 * Retourne une copie de `value` où les secrets sont remplacés par `**********` et les emails tronqués.
 * Ne modifie jamais l'objet d'origine.
 */
export function redactValue<T>(value: T): T {
  return redactRecursive(value, 0, new WeakSet()) as T;
}

/**
 * Redaction d'un événement Sentry (hook `beforeSend`).
 *
 * Le format winston ne protège que les journaux : Sentry reçoit, lui, le corps de la requête
 * (`requestDataIntegration`, lu au moment de l'événement), les en-têtes, les cookies et tout `extra`.
 */
export function redactSentryEvent<T>(event: T): T {
  if (!event || typeof event !== "object") return event;
  const target = event as unknown as Record<string, unknown>;
  try {
    for (const key of ["extra", "contexts", "user", "breadcrumbs", "tags"]) {
      if (target[key] !== undefined) target[key] = redactValue(target[key]);
    }
    if (typeof target.message === "string") target.message = redactString(target.message);
    const request = target.request as Record<string, unknown> | undefined;
    if (request && typeof request === "object") {
      for (const key of ["data", "headers", "cookies", "env"]) {
        if (request[key] !== undefined) request[key] = redactValue(request[key]);
      }
      if (typeof request.url === "string") request.url = redactUrl(request.url);
      if (typeof request.query_string === "string") request.query_string = redactString(request.query_string);
    }
    return event;
  } catch {
    // un événement partiellement redacté vaut mieux qu'une exception dans le pipeline Sentry
    return event;
  }
}

const SPLAT = Symbol.for("splat");

/**
 * Transformation winston : redaction du message et de toutes les meta d'un objet `info`.
 * Retourne un nouvel objet sans jamais modifier `info`, y compris quand `info` est une Error
 * (`logger.error(err)`) dont `message` et `stack` ne sont pas énumérables.
 *
 * winston relance toute exception d'un format dans le code appelant : la redaction ne doit jamais échouer.
 */
export function redactLogInfo<T extends object>(info: T): T {
  try {
    return redactInfo(info);
  } catch (error) {
    const level = (info as { level?: unknown }).level;
    return { level, message: `[redaction failed: ${error instanceof Error ? error.name : "unknown"}]` } as unknown as T;
  }
}

function redactInfo<T extends object>(info: T): T {
  const source: Record<string, unknown> = {};
  for (const key of Object.keys(info)) source[key] = safeRead(info as Record<string, unknown>, key);
  const { message, stack } = info as { message?: unknown; stack?: unknown };
  if (!("message" in source) && message !== undefined) source.message = message;
  // winston enveloppe une Error sans message en `{ message: err }` : la garder imprimable
  if (source.message instanceof Error) source.message = redactString(String(source.message));

  const redacted = redactValue({ ...source, toJSON: undefined }) as Record<string, unknown>;
  delete redacted.toJSON;
  redacted.level = source.level;

  const out: Record<string | symbol, unknown> = {};
  // SPLAT porte les meta brutes, non redactées : ne pas les transmettre aux transports.
  // Les meta ont déjà été fusionnées dans `info` par winston, rien n'est perdu pour l'écriture du log.
  for (const symbol of Object.getOwnPropertySymbols(info)) {
    if (symbol !== SPLAT) out[symbol] = (info as Record<symbol, unknown>)[symbol];
  }
  Object.assign(out, redacted);
  if (!("stack" in source) && typeof stack === "string") {
    Object.defineProperty(out, "stack", { value: redactString(stack), enumerable: false, writable: true, configurable: true });
  }
  return out as T;
}

// Hooks Sentry des fronts (admin, app, snupport-app)
export * from "./sentryFront";
