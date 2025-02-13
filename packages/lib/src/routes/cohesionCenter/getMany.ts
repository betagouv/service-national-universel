import { CohesionCenterType } from "../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "..";

export interface GetManyCentersRoute extends BasicRoute {
    method: "POST";
    path: "/cohesion-center/getMany";
    payload: {
      ids: string[];
    };
    response: RouteResponseBody<CohesionCenterType[]>;
  }