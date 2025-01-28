import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface DeletePDT extends BasicRoute {
  method: "DELETE";
  path: "/phase1/{sessionId}/plan-de-transport";
  params: { sessionId: string };
  response: RouteResponseBodyV2<{
    ligneBusIdCount: number;
    segmentDeLigneCount: number;
    classeCount: number;
    demandeDeModifCount: number;
    planDeTransportCount: number;
    jeunesUpdatedCount: number;
  }>;
}
