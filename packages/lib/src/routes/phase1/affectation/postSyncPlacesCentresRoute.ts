import { BasicRoute, RouteResponseBodyV2 } from "../../..";

export interface PostSyncPlacesCentresRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/centre/sync-places";
  params: { sessionId: string };
  response: RouteResponseBodyV2<void>;
}
