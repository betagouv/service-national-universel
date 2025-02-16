import { BasicRoute, RouteResponseBody } from "..";

export interface CreateDistributionListBrevoRoute extends BasicRoute {
  method: "POST";
  path: "/plan-marketing/liste-diffusion";
  payload: {
    nom: string;
    campagneId: string;
    pathFile: string;
  };
  response: RouteResponseBody<string>;
}
