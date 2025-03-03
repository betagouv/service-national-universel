import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { SimulationAffectationCLEDromComTaskDto } from "../../../dto/phase1";

export interface PostSimulationAffectationCLEDromComRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulation/cle-dromcom";
  params: { sessionId: string };
  payload: {
    departements: string[];
    etranger: boolean;
  };
  response: RouteResponseBodyV2<SimulationAffectationCLEDromComTaskDto>;
}
