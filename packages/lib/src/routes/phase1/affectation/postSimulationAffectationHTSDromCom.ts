import { BasicRoute, GRADES, RouteResponseBodyV2 } from "../../..";

import { SimulationAffectationCLEDromComTaskDto } from "../../../dto/phase1";

export interface PostSimulationAffectationHTSDromComRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulation/hts-dromcom";
  params: { sessionId: string };
  payload: {
    niveauScolaires: Array<keyof typeof GRADES>;
    departements: string[];
    etranger: boolean;
  };
  response: RouteResponseBodyV2<SimulationAffectationCLEDromComTaskDto>;
}
