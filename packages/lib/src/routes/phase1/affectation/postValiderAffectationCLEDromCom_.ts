import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { ValiderAffectationCLEDromComTaskDto } from "../../../dto/phase1";

export interface PostValiderAffectationCLEDromComRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulation/{simulationId}/valider/cle-dromcom";
  params: { sessionId: string; simulationId: string };
  response: RouteResponseBodyV2<ValiderAffectationCLEDromComTaskDto>;
}
