import { GRADES } from "../../../constants/constants";
import { YoungDto } from "../../../dto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

import { SimulationBasculeJeunesNonValidesTaskDto } from "../../../dto/phase1";

export interface PostBasculeJeunesNonValidesRoute extends BasicRoute {
  method: "POST";
  path: "/inscription/{sessionId}/bascule-jeunes-non-valides/simulation";
  params: { sessionId: string };
  payload: {
    status: YoungDto["status"][];
    niveauScolaires: Array<keyof typeof GRADES>;
    departements: string[];
    etranger: boolean;
    avenir: boolean;
  };
  response: RouteResponseBodyV2<SimulationBasculeJeunesNonValidesTaskDto>;
}
