import { BasicRoute, RouteResponseBody } from "..";

export interface getTauxRemplissageRoute extends BasicRoute {
  method: "GET";
  path: "/inscription-goal/{cohort}/department/{departement}";
  params: { cohort: string; departement: string };
  response: RouteResponseBody<number>;
}
