import { BasicRoute, buildRequestPath, buildRequestQueryString } from "snu-lib";

import api from "@/services/api";

export function buildRequest<Route extends BasicRoute>({ params, payload, path, method, query }: Omit<Route, "response">): () => Promise<Route["response"]> {
  const finalPath = buildRequestPath(path, params);
  const queryString = buildRequestQueryString(query);

  const url = `${finalPath}${queryString}`;

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
