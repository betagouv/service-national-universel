export interface BasicRoute {
  path: string;
  params?: Record<string, number | string | null | undefined>;
  payload?: Record<string, any>;
  query?: Record<string, any>;
  response?: RouteResponseBody<Record<string, any> | Record<string, any>[] | number | boolean>;
  method: "GET" | "POST" | "DELETE" | "PUT";
}

export type RouteResponseBody<T> = { ok: boolean; data?: T; code?: string; message?: string };

export type { CohortsRoutes } from "./cohort";
export type { CohortGroupRoutes } from "./cohortGroup";
export type { ClassesRoutes } from "./cle/classe";
export type { InscriptionGoalsRoutes } from "./inscriptiongoal";
export type { PreinscriptionRoutes } from "./preinscription";

export interface HttpError {
  message: string;
  statusCode: number;
  correlationId: string;
}
