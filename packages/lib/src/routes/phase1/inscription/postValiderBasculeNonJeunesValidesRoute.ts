import { BasicRoute, RouteResponseBodyV2 } from "../../..";

import { ValiderBasculeJeunesNonValidesTaskDto } from "../../../dto/phase1";

export interface PostValiderBasculeJeunesNonValidesRoute extends BasicRoute {
  method: "POST";
  path: "/inscription/{sessionId}/simulation/{simulationId}/bascule-jeunes-non-valides/valider";
  params: { sessionId: string; simulationId: string };
  response: RouteResponseBodyV2<ValiderBasculeJeunesNonValidesTaskDto>;
  payload: {
    sendEmail: boolean;
  };
}
