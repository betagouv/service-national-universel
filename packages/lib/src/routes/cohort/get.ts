import { CohortDto } from "src/dto";
import { BasicRoute, RouteResponse } from "..";

export interface GetCohortRoute extends BasicRoute {
  method: "GET";
  path: "/cohort/{id}";
  params: { id: string };
  response: RouteResponse<CohortDto>;
}
