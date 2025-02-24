import { ReferentType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface GetManyReferentsRoute extends BasicRoute {
  method: "POST";
  path: "/cle/referent/getMany";
  payload: {
    ids: string[];
  };
  response: RouteResponseBody<ReferentType[]>;
}