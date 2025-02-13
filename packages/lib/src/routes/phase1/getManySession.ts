import { SessionPhase1Type } from "../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "..";

export interface GetManySessionPhase1Route extends BasicRoute {
    method: "POST";
    path: "/session-phase1/getMany";
    payload: {
      ids: string[];
    };
    response: RouteResponseBody<SessionPhase1Type[]>;
   }