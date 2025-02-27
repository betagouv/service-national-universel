import { BasicRoute, RouteResponseBodyV2 } from "../../..";

export interface PostSyncPlacesLignesDeBusRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/ligne-de-bus/sync-places";
  params: { sessionId: string };
  response: RouteResponseBodyV2<void>;
}
