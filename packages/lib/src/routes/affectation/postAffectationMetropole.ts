import { SimulationAffectationHTSTaskDto } from "../../dto/affectation/SimulationAffectationHTSTaskDto";
import { GRADES } from "../../constants/constants";
import { BasicRoute, RouteResponseBodyV2 } from "..";

export interface PostSimulationsRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulations";
  params: { sessionId: string };
  payload: {
    departements: string[];
    niveauScolaires: Array<keyof typeof GRADES>;
    changementDepartements: { origine: string; destination: string }[];
    etranger?: boolean;
    affecterPDR?: boolean;
  };
  response: RouteResponseBodyV2<SimulationAffectationHTSTaskDto>;
}
