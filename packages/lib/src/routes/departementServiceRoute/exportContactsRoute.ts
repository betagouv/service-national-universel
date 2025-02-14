import { BasicRoute, RouteResponseBody } from "..";

export interface ExportContactsRoute extends BasicRoute {
  method: "GET";
  path: "/department-service-goal/{sessionId}/DepartmentServiceContact/export";
  params: { sessionId: string };
  response: RouteResponseBody<{
    resultSansContact: any[];
    resultAvecContact: any[];
    cohortName: string;
  }>;
}

export type DepartmentServiceRoutes = {
  ExportContacts: ExportContactsRoute;
};