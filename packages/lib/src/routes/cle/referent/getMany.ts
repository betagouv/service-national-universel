import { ReferentType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface GetManyReferentsRoute extends BasicRoute {
  method: "POST";
  path: "/cle/referent";
  payload: {
    ids: string[];
  };
  response: RouteResponseBody<ReferentType[]>;
}