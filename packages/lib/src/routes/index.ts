export interface BasicRoute {
  path: string;
  params?: Record<string, number | string | null | undefined>;
  payload?: Record<string, any>;
  query?: Record<string, any>;
  response?: RouteResponseBody<Record<string, any> | Record<string, any>[] | boolean>;
  method: "GET" | "POST" | "DELETE" | "PUT";
}

export type RouteResponseBody<T> = { ok: boolean; data?: T; code?: string; message?: string };

export type { CohortsRoutes } from "./cohort";
export type { ClassesRoutes } from "./cle/classe";
export type { PreinscriptionRoutes } from "./preinscription";
