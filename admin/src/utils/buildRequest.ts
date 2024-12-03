import { BasicRoute, buildRequestPath, buildRequestQueryString } from "snu-lib";

import apiv1 from "@/services/api";
import { apiv2 } from "@/services/apiv2";

export type TargetType = "API" | "API_V2" | undefined;

export function buildRequest<Route extends BasicRoute>({
  params,
  payload,
  path,
  method,
  query,
  target,
}: Omit<Route, "response"> & { target?: TargetType }): () => Promise<Route["response"]> {
  const finalPath = buildRequestPath(path, params);
  const queryString = buildRequestQueryString(query);

  const url = `${finalPath}${queryString}`;

  const api = target === "API_V2" ? apiv2 : apiv1;

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
