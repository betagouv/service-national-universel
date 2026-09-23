import qs from "query-string";

import { BasicRoute } from "../routes";

// Domaines vers lesquels une redirection absolue (après connexion notamment) est autorisée,
// sous-domaines compris : admin, moncompte, support...
const ALLOWED_REDIRECT_DOMAINS = ["snu.gouv.fr", "beta-snu.dev"];
// Origine fictive servant à résoudre les chemins relatifs : un chemin qui reste sur le site
// garde cette origine une fois résolu.
const RELATIVE_BASE = "https://relative.invalid";

function parseRedirectUrl(url: unknown): { url: URL; isRelative: boolean } | null {
  if (typeof url !== "string" || url.length === 0) return null;
  // Les navigateurs ignorent tabulations et retours à la ligne et lisent « \ » comme « / »
  // avant d'interpréter une URL (« java\tscript: », « /\evil.tld ») : on les refuse d'emblée.
  // eslint-disable-next-line no-control-regex -- les caractères de contrôle sont précisément ce qu'on refuse
  if (/[\u0000-\u0020\u007f\\]/.test(url)) return null;
  let parsed: URL;
  try {
    parsed = new URL(url, RELATIVE_BASE);
  } catch {
    return null;
  }
  // Un schéma explicite (javascript:, data:, https:hôte...) ou « //hôte » désigne une URL absolue.
  const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith("//");
  if (!isAbsolute && parsed.origin === RELATIVE_BASE) return { url: parsed, isRelative: true };
  if (!isAbsolute) return null;
  return { url: parsed, isRelative: false };
}

// Vrai si `url` est un chemin relatif qui reste sur le site courant (à suivre avec history.push).
export function isInternalRedirectUrl(url: unknown): boolean {
  return parseRedirectUrl(url)?.isRelative === true;
}

// Vrai si `url` peut servir de cible de redirection : un chemin relatif qui reste sur le site,
// ou une URL https sans identifiants ni port vers un domaine SNU (ou l'un de ses sous-domaines).
// Tout autre schéma (javascript:, data:...) et tout hôte imité (snu.gouv.fr.evil.tld,
// snu.gouv.fr@evil.tld) est refusé.
export function isValidRedirectUrl(url: unknown): boolean {
  const parsed = parseRedirectUrl(url);
  if (!parsed) return false;
  if (parsed.isRelative) return true;
  const { protocol, username, password, port, hostname } = parsed.url;
  if (protocol !== "https:" || username || password || port) return false;
  return ALLOWED_REDIRECT_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

export function buildRequestPath(path: BasicRoute["path"], params: BasicRoute["params"]): string {
  let finalPath = path;
  if (params && Object.keys(params).length > 0) {
    for (const paramKey in params) {
      const value = params[paramKey];
      if (value === null || value === undefined) {
        finalPath = finalPath.replace(`{${paramKey}}`, "");
        finalPath = finalPath.replace(`{${paramKey}?}`, "");
      } else {
        finalPath = finalPath.replace(`{${paramKey}}`, `${value}`);
        finalPath = finalPath.replace(`{${paramKey}?}`, `${value}`);
      }
    }
  }
  // Remove optionnal params if they are not filled
  finalPath = finalPath.replace(/\/\{[a-zA-Z0-9]+\?\}/g, "");

  return finalPath;
}

export function buildRequestQueryString(query: BasicRoute["query"] = {}): string {
  if (!query || Object.keys(query).length === 0) {
    return "";
  }
  return `?${qs.stringify(query, {arrayFormat: 'separator', arrayFormatSeparator: '~'})}`;
}

export const hashToFormData = <T extends Record<string, unknown>>(hash: T, path: string): FormData => {
  const formData = new FormData();

  Object.entries(hash).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((arrayValue) => {
        formData.append(`${path}[${key}][]`, typeof arrayValue === "object" && arrayValue !== null ? JSON.stringify(arrayValue) : String(arrayValue));
      });
    } else if (value instanceof Date) {
      formData.append(`${path}[${key}]`, value.toISOString());
    } else if (value instanceof Blob || value instanceof File) {
      formData.append(`${path}[${key}]`, value, "file");
    } else if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([hashKey, hashValue]) => {
        if (Array.isArray(hashValue)) {
          hashValue.forEach((arrayValue) => {
            formData.append(`${path}[${key}][${hashKey}][]`, typeof arrayValue === "object" && arrayValue !== null ? JSON.stringify(arrayValue) : String(arrayValue));
          });
        } else {
          formData.append(`${path}[${key}][${hashKey}]`, String(hashValue));
        }
      });
    } else if (value !== undefined) {
      formData.append(`${path}[${key}]`, String(value));
    }
  });
  return formData;
};
