import { BasicRoute, RouteResponseBodyV2 } from "..";
import { SimulationPhase1TaskHTSTaskDto } from "../../dto";

export interface GetSimulationsRoute extends BasicRoute {
  method: "GET";
  path: "/phase1/{sessionId}/simulations";
  params: { sessionId: string };
  query: {
    status?: SimulationPhase1TaskHTSTaskDto["status"];
    name?: SimulationPhase1TaskHTSTaskDto["name"];
    sort?: "ASC" | "DESC";
  };
  response: RouteResponseBodyV2<SimulationPhase1TaskHTSTaskDto[]>;
}
