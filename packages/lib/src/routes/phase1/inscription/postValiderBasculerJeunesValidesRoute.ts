import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { ValiderBasculerJeunesValidesTaskDto } from "../../../dto/phase1";

export interface PostValiderBasculerJeunesValidesRoute extends BasicRoute {
  method: "POST";
  path: "/inscription/{sessionId}/simulation/{simulationId}/bacule-jeunes-valides/valider";
  params: { sessionId: string; simulationId: string };
  response: RouteResponseBodyV2<ValiderBasculerJeunesValidesTaskDto>;
  payload: {
    sendEmail: boolean;
  };
}
