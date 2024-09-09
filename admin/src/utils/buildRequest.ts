import { isEmpty, isNil } from "lodash";
import qs from "query-string";

import { BasicRoute } from "snu-lib";

import api from "@/services/api";

function buildPath(path: BasicRoute["path"], params: BasicRoute["params"]): string {
  let finalPath = path;
  if (!isEmpty(params)) {
    for (const paramKey in params) {
      const value = params[paramKey];
      if (isNil(value)) {
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

function buildQueryString(query: BasicRoute["query"] = {}): string {
  if (isEmpty(query)) {
    return "";
  }
  return `?${qs.stringify(query)}`;
}

export const buildURL = ({ params, path, query }: Pick<BasicRoute, "params" | "path" | "query">) => {
  const finalPath = buildPath(path, params);
  const queryString = buildQueryString(query);

  return `${finalPath}${queryString}`;
};

export function buildRequest<Route extends BasicRoute>({ params, payload, path, method, query }: Omit<Route, "response">): () => Promise<Route["response"]> {
  const url = buildURL({ params, path, query });

  switch (method) {
    case "GET":
      return async () => api.get(url);
    case "POST":
      return async () => api.post(url, payload);
    case "PUT":
      return async () => api.put(url, payload);
    case "DELETE":
      return async () => api.remove(url, payload);
    default:
      throw new Error("Method not supported");
  }
}
