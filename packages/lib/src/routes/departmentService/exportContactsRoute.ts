import { BasicRoute, RouteResponseBody } from "..";

export interface ExportContactsRoute extends BasicRoute {
  method: "GET";
  path: "/department-service/{sessionId}/DepartmentServiceContact/export";
  params: { sessionId: string };
  response: RouteResponseBody<{
    base64: string;
    mimeType: string;
    fileName: string;
  }>;
}