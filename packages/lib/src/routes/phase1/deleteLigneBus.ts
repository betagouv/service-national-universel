import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface DeleteLigneBus extends BasicRoute {
  method: "DELETE";
  path: "/phase1/{sessionId}/ligne-de-bus/{busId}";
  params: {
    sessionId: string;
    busId: string;
  };
  response: RouteResponseBodyV2<void>;
}
