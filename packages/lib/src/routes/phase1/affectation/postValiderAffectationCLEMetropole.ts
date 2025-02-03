import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { ValiderAffectationHTSTaskDto } from "../../../dto/phase1";

export interface PostValiderAffectationCLERoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulation/{simulationId}/valider/cle";
  params: { sessionId: string; simulationId: string };
  response: RouteResponseBodyV2<ValiderAffectationHTSTaskDto>;
}
