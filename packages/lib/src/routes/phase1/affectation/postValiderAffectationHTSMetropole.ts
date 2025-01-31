import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { ValiderAffectationHTSTaskDto } from "../../../dto/phase1";

export interface PostValiderAffectationHTSRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/simulation/{simulationId}/valider/hts";
  params: { sessionId: string; simulationId: string };
  payload: {
    affecterPDR: boolean;
  };
  response: RouteResponseBodyV2<ValiderAffectationHTSTaskDto>;
}
