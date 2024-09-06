export interface BasicRoute {
  path: string;
  params?: Record<string, number | string | null | undefined>;
  payload?: Record<string, any>;
  query?: Record<string, any>;
  response?: RouteResponse<Record<string, any> | Record<string, any>[]>;
  method: "GET" | "POST" | "DELETE" | "PUT";
}

export type RouteResponse<T> = { ok: boolean; code?: string; data: T };

export { CohortsRoutes } from "./cohort";
export { ClassesRoutes } from "./cle/classe";
