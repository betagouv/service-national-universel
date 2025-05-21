import qs from "query-string";

import { BasicRoute } from "../routes";

export function isValidRedirectUrl(url) {
  // Check if the URL starts with "http://" or "https://"
  const protocolCheck = /^https?:\/\//;
  // Check if the URL start with more than one "/" because with 2 it can redirect to another website
  const doubleSlashCheck = /^\/\//;
  // To authorize the redirect that stays on the current website and prevent bad redirections
  if (!protocolCheck.test(url) && !doubleSlashCheck.test(url)) return true;
  // Check if the domain is "snu.gouv.fr" or "beta-snu.dev" and force the https
  const domainCheck = /^https:\/\/([a-z0-9]+[.])*?(snu\.gouv\.fr|beta-snu\.dev)/;
  return domainCheck.test(url);
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
  return `?${qs.stringify(query)}`;
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
