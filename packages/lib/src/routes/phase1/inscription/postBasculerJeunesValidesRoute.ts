import { GRADES } from "../../../constants/constants";
import { YoungDto } from "../../../dto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

import { SimulationBasculerJeunesValidesTaskDto } from "../../../dto/phase1";

export interface PostBasculerJeunesValidesRoute extends BasicRoute {
  method: "POST";
  path: "/inscription/{sessionId}/bacule-jeunes-valides/simulation";
  params: { sessionId: string };
  payload: {
    status: YoungDto["status"][];
    statusPhase1: YoungDto["statusPhase1"][];
    cohesionStayPresence: boolean;
    statusPhase1Motif: YoungDto["statusPhase1Motif"][];
    niveauScolaires: Array<keyof typeof GRADES>;
    departements: string[];
    etranger: boolean;
    avenir: boolean;
  };
  response: RouteResponseBodyV2<SimulationBasculerJeunesValidesTaskDto>;
}
