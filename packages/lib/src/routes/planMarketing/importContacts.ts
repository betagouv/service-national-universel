import { BasicRoute, RouteResponseBody } from "..";

export interface ImportContactsBrevoRoute extends BasicRoute {
  method: "POST";
  path: "/plan-marketing/import";
  payload: {
    filePath: string;
  };
  response: RouteResponseBody<string>;
}
