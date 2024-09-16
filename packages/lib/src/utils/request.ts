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

  return finalPath;
}

export function buildRequestQueryString(query: BasicRoute["query"] = {}): string {
  if (!query || Object.keys(query).length > 0) {
    return "";
  }
  return `?${qs.stringify(query)}`;
}
