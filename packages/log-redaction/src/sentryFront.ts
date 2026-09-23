/**
 * Redaction des événements Sentry émis par les fronts (admin, app, snupport-app).
 *
 * Plus stricte que `redactSentryEvent` (API) : un front n'a aucune raison d'envoyer à Sentry un corps de requête
 * ou de réponse, une query string ou un console.log. Ces données sont retirées, pas seulement masquées par nom de clé :
 * elles portent des PII sans clé reconnaissable (dossier du volontaire, termes de recherche, messages de tickets).
 *
 * À brancher sur `beforeSend`, `beforeSendTransaction` et `beforeBreadcrumb`.
 */
import { redactString, redactUrl, redactValue } from "./index";

export const FILTERED = "[Filtered]";

// Clés dont la valeur est un corps de requête ou de réponse : `extra.body`, `extra.responseText`, contexte `AxiosError`
// (`config.data`, `response.data`, `request`), extra `{ response }` de snupport-app.
const BODY_KEYS = new Set(["body", "data", "response", "responsetext", "responsebody", "requestbody", "request", "state"]);

// Clés dont la valeur est une URL de navigation ou de requête
const FRONT_URL_KEYS = new Set(["url", "href", "link", "from", "to", "referer", "referrer", "location", "httpurl", "urlfull", "path"]);

// Contextes posés par le SDK lui-même : aucune donnée métier, les retirer casserait le regroupement des traces
const SDK_CONTEXTS = new Set(["trace", "os", "browser", "device", "runtime", "app", "culture", "react", "response_context"]);

// URL absolue dans un texte libre (message d'erreur, description de span)
const ABSOLUTE_URL_REGEX = /\bhttps?:\/\/[^\s"'<>]+/gi;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * URL d'un front : les segments de chemin qui portent un jeton sont masqués (`/contract/token/<jeton>`,
 * `/young/validate_phase3/<id>/<jeton>`) et la query string comme le fragment sont retirés
 * (`?token=`, `?advancedSearch=<email>`).
 */
export function redactFrontUrl(url: string): string {
  if (typeof url !== "string" || !url) return url;
  const cut = url.search(/[?#]/);
  const base = cut === -1 ? url : url.slice(0, cut);
  const redacted = redactUrl(base);
  return cut === -1 ? redacted : `${redacted}?${FILTERED}`;
}

/** Texte libre : chaque URL absolue qu'il contient est traitée par `redactFrontUrl`, puis filet de `redactString` */
export function redactFrontText(text: string): string {
  if (typeof text !== "string" || !text) return text;
  return redactString(text.replace(ABSOLUTE_URL_REGEX, (url) => redactFrontUrl(url)));
}

function stripRecursive(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactFrontText(value);
  if (typeof value !== "object") return value;
  if (depth >= 12) return "[depth limit]";
  if (seen.has(value)) return "[circular]";
  seen.add(value);
  try {
    if (Array.isArray(value)) return value.map((item) => stripRecursive(item, depth + 1, seen));
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      const normalized = normalizeKey(key);
      let child: unknown;
      try {
        child = (value as Record<string, unknown>)[key];
      } catch {
        child = "[getter failed]";
      }
      if (BODY_KEYS.has(normalized)) {
        if (child !== undefined && child !== null && child !== "") out[key] = FILTERED;
        continue;
      }
      if (FRONT_URL_KEYS.has(normalized) && typeof child === "string") {
        out[key] = redactFrontUrl(child);
        continue;
      }
      out[key] = stripRecursive(child, depth + 1, seen);
    }
    return out;
  } finally {
    seen.delete(value);
  }
}

/** Retire les corps de requête/réponse et les query strings, puis masque les secrets et emails par nom de clé */
export function redactFrontValue<T>(value: T): T {
  return redactValue(stripRecursive(value, 0, new WeakSet())) as T;
}

type Breadcrumb = {
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
} & Record<string, unknown>;

/**
 * Hook `beforeBreadcrumb`. Les breadcrumbs `console` sont supprimés : tout `console.log` d'un objet métier
 * (préférences de mission, erreur d'API) finirait sinon dans l'événement suivant.
 */
export function redactFrontBreadcrumb<T>(breadcrumb: T): T | null {
  if (!breadcrumb || typeof breadcrumb !== "object") return breadcrumb;
  const crumb = breadcrumb as unknown as Breadcrumb;
  if (crumb.category === "console") return null;
  try {
    if (typeof crumb.message === "string") crumb.message = redactFrontText(crumb.message);
    if (crumb.data !== undefined) crumb.data = redactFrontValue(crumb.data);
    return breadcrumb;
  } catch {
    return null;
  }
}

/**
 * Hook `beforeSend` et `beforeSendTransaction`.
 *
 * Ne lève jamais : en cas d'échec, l'événement est abandonné plutôt qu'envoyé sans redaction.
 */
export function redactFrontSentryEvent<T>(event: T): T | null {
  if (!event || typeof event !== "object") return event;
  const target = event as unknown as Record<string, unknown>;
  try {
    for (const key of ["extra", "tags", "user"]) {
      if (target[key] !== undefined) target[key] = redactFrontValue(target[key]);
    }

    const contexts = target.contexts as Record<string, unknown> | undefined;
    if (contexts && typeof contexts === "object") {
      for (const name of Object.keys(contexts)) {
        // state Redux (createReduxEnhancer) : profil du volontaire, tickets ; jamais utile au diagnostic
        if (name === "state") {
          delete contexts[name];
          continue;
        }
        if (SDK_CONTEXTS.has(name)) continue;
        contexts[name] = redactFrontValue(contexts[name]);
      }
      const trace = contexts.trace as Record<string, unknown> | undefined;
      if (trace && typeof trace === "object" && trace.data !== undefined) trace.data = redactFrontValue(trace.data);
    }

    if (Array.isArray(target.breadcrumbs)) {
      target.breadcrumbs = target.breadcrumbs.map((crumb) => redactFrontBreadcrumb(crumb)).filter((crumb) => crumb !== null);
    }

    const request = target.request as Record<string, unknown> | undefined;
    if (request && typeof request === "object") {
      delete request.data;
      delete request.cookies;
      delete request.query_string;
      if (typeof request.url === "string") request.url = redactFrontUrl(request.url);
      if (request.headers !== undefined) request.headers = redactFrontValue(request.headers);
    }

    if (typeof target.message === "string") target.message = redactFrontText(target.message);
    if (typeof target.transaction === "string") target.transaction = redactFrontText(target.transaction);

    const exception = target.exception as { values?: Array<Record<string, unknown>> } | undefined;
    for (const value of exception?.values || []) {
      if (typeof value.value === "string") value.value = redactFrontText(value.value);
    }

    if (Array.isArray(target.spans)) {
      for (const span of target.spans as Array<Record<string, unknown>>) {
        if (!span || typeof span !== "object") continue;
        if (typeof span.description === "string") span.description = redactFrontText(span.description);
        if (span.data !== undefined) span.data = redactFrontValue(span.data);
      }
    }
    return event;
  } catch {
    return null;
  }
}
