import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { GRADES } from "../../../constants/constants";
import { SimulationAffectationHTSTaskDto } from "../../../dto/phase1";

export interface PostSimulationsRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulations";
  params: { sessionId: string };
  payload: {
    departements: string[];
    niveauScolaires: Array<keyof typeof GRADES>;
    sdrImportId: string;
    etranger: boolean;
    affecterPDR: boolean;
  };
  response: RouteResponseBodyV2<SimulationAffectationHTSTaskDto>;
}
