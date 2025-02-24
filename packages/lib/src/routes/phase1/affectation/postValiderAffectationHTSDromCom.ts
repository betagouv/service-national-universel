import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { ValiderAffectationCLEDromComTaskDto } from "../../../dto/phase1";

export interface PostValiderAffectationHTSDromComRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulation/{simulationId}/valider/hts-dromcom";
  params: { sessionId: string; simulationId: string };
  response: RouteResponseBodyV2<ValiderAffectationCLEDromComTaskDto>;
}
