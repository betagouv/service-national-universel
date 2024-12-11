import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { ValiderAffectationHTSTaskDto } from "../../../dto/phase1";

export interface PostValiderAffectationRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulation/{simulationId}/valider";
  params: { sessionId: string; simulationId: string };
  payload: {
    affecterPDR: boolean;
  };
  response: RouteResponseBodyV2<ValiderAffectationHTSTaskDto>;
}
