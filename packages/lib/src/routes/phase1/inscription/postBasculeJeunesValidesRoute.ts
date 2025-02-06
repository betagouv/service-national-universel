import { GRADES } from "../../../constants/constants";
import { YoungDto } from "../../../dto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

import { SimulationBasculeJeunesValidesTaskDto } from "../../../dto/phase1";

export interface PostBasculeJeunesValidesRoute extends BasicRoute {
  method: "POST";
  path: "/inscription/{sessionId}/bascule-jeunes-valides/simulation";
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
  response: RouteResponseBodyV2<SimulationBasculeJeunesValidesTaskDto>;
}
