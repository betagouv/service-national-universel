import { CohortDto } from "src/dto";
import { BasicRoute, RouteResponseBody } from "..";

export interface GetOneCohortRoute extends BasicRoute {
  method: "GET";
  path: "/cohort/{id}";
  params: { id: string };
  response: RouteResponseBody<CohortDto>;
}
