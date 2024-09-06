import { CohortDto } from "src/dto";
import { BasicRoute, RouteResponseBody } from "..";

export interface GetCohortRoute extends BasicRoute {
  method: "GET";
  path: "/cohort/{id}";
  params: { id: string };
  response: RouteResponseBody<CohortDto>;
}
