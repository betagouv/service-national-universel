import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { SimulationAffectationCLETaskDto } from "../../../dto/phase1";

export interface PostSimulationsCLERoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulation/cle";
  params: { sessionId: string };
  payload: {
    departements: string[];
    etranger: boolean;
  };
  response: RouteResponseBodyV2<SimulationAffectationCLETaskDto>;
}
