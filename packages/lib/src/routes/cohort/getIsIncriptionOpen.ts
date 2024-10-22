import { BasicRoute, RouteResponseBody } from "..";

export interface GetIsIncriptionOpenRoute extends BasicRoute {
  method: "GET";
  path: "/cohort-session/isInscriptionOpen";
  query: {
    sessionName?: string;
  };
  response: RouteResponseBody<boolean>;
}
