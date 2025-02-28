import { BasicRoute, RouteResponseBodyV2 } from "../../..";

export interface PostSyncPlacesCentreRoute extends BasicRoute {
  method: "POST";
  path: "/affectation/{sessionId}/centre/{centreId}/sync-places";
  params: { sessionId: string; centreId: string };
  response: RouteResponseBodyV2<void>;
}
