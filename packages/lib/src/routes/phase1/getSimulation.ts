import { BasicRoute, RouteResponseBodyV2 } from "..";
import { Phase1HTSTaskDto } from "../../dto";

export interface GetSimulationRoute extends BasicRoute {
  method: "GET";
  path: "/phase1/simulations/{id}";
  params: { id: string };
  response: RouteResponseBodyV2<Phase1HTSTaskDto>;
}
