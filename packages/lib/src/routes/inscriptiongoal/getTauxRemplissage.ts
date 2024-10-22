import { BasicRoute, RouteResponseBody } from "..";

export interface GetTauxRemplissageRoute extends BasicRoute {
  method: "GET";
  path: "/inscription-goal/{cohort}/department/{department}";
  params: { cohort: string; department: string };
  response: RouteResponseBody<number>;
}
