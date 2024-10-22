import { BasicRoute, RouteResponseBody } from "..";

export interface GetIsReincriptionOpenRoute extends BasicRoute {
  method: "GET";
  path: "/cohort-session/isReInscriptionOpen";
  response: RouteResponseBody<boolean>;
}
