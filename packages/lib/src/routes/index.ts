export interface BasicRoute {
  path: string;
  params?: Record<string, number | string | null | undefined>;
  payload?: Record<string, any>;
  query?: Record<string, any>;
  response?: RouteResponseBody<Record<string, any> | Record<string, any>[] | number | boolean> | RouteResponseBodyV2<object> | void;
  method: "GET" | "POST" | "DELETE" | "PUT";
}

export type RouteResponseBody<T> = { ok: boolean; data?: T; code?: string; message?: string };
export type RouteResponseBodyV2<T> = T;

export interface HttpError {
  message: string;
  statusCode: number;
  correlationId: string;
  description?: string;
}

export class FunctionalException implements HttpError {
  message: string;
  statusCode: number;
  correlationId: string;
  description?: string;
  constructor(exception: HttpError) {
    this.message = exception.message;
    this.statusCode = exception.statusCode;
    this.correlationId = exception.correlationId;
    this.description = exception.description;
  }
}

export type { CohortsRoutes } from "./cohort";
export type { CohortGroupRoutes } from "./cohortGroup";
export type { ClassesRoutes } from "./cle/classe";
export type { InscriptionGoalsRoutes } from "./inscriptiongoal";
export type { PreinscriptionRoutes } from "./preinscription";
export type { AffectationRoutes } from "./phase1/affectation";
export type { DesistementRoutes } from "./phase1/desistement";
export type { ReferentielRoutes } from "./referentiel";
export type { ReferentRoutes } from "./iam/referent";
export type { ReferentsRoutes } from "./cle/referent";
export type { FilterLabelRoutes } from "./filterLabel";
export type { DepartmentServiceRoutes } from "./departmentService";
export type { PlanMarketingRoutes } from "./planMarketing";
export type { AnalyticsRoutes } from "./analytics";

export * from "./phase1";
export * from "./phase2";
