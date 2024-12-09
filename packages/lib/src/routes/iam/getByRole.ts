import { BasicRoute, RouteResponseBody } from "..";
import { ReferentDto } from "src/dto";

export interface GetByRoleRoute extends BasicRoute {
  method: "GET";
  path: "/referent/role/{role}";
  params: { role: string };
  response: RouteResponseBody<ReferentDto>;
}
