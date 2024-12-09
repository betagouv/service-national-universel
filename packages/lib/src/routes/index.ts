export interface BasicRoute {
  path: string;
  params?: Record<string, number | string | null | undefined>;
  payload?: Record<string, any>;
  query?: Record<string, any>;
  response?: RouteResponseBody<Record<string, any> | Record<string, any>[] | number | boolean> | RouteResponseBodyV2<object>;
  method: "GET" | "POST" | "DELETE" | "PUT";
}

export type RouteResponseBody<T> = { ok: boolean; data?: T; code?: string; message?: string };
export type RouteResponseBodyV2<T> = T;

export interface HttpError {
  message: string;
  description?: string;
  statusCode: number;
  correlationId: string;
}

export type { CohortsRoutes } from "./cohort";
export type { CohortGroupRoutes } from "./cohortGroup";
export type { ClassesRoutes } from "./cle/classe";
export type { InscriptionGoalsRoutes } from "./inscriptiongoal";
export type { PreinscriptionRoutes } from "./preinscription";
export type { AffectationRoutes } from "./phase1/affectation";
export type { ReferentielRoutes } from "./referentiel";
export * from "./phase1";
