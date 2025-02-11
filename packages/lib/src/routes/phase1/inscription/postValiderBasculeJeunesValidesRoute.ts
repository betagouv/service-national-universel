import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { ValiderBasculeJeunesValidesTaskDto } from "../../../dto/phase1";

export interface PostValiderBasculeJeunesValidesRoute extends BasicRoute {
  method: "POST";
  path: "/inscription/{sessionId}/simulation/{simulationId}/bascule-jeunes-valides/valider";
  params: { sessionId: string; simulationId: string };
  response: RouteResponseBodyV2<ValiderBasculeJeunesValidesTaskDto>;
  payload: {
    sendEmail: boolean;
  };
}
