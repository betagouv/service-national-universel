import { BasicRoute, RouteResponseBodyV2 } from "..";
import { Phase1HTSTaskDto } from "../../dto";

export interface GetSimulationsRoute extends BasicRoute {
  method: "GET";
  path: "/phase1/{sessionId}/simulations";
  params: { sessionId: string };
  query: {
    status?: Phase1HTSTaskDto["status"];
    name?: Phase1HTSTaskDto["name"];
    sort?: "ASC" | "DESC";
  };
  response: RouteResponseBodyV2<Phase1HTSTaskDto[]>;
}
