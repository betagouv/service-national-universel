import { EtablissementType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface GetManyEtablissementsRoute extends BasicRoute {
  method: "POST";
  path: "/cle/etablissement/getMany";
  payload: {
    ids: string[];
  };
  response: RouteResponseBody<EtablissementType[]>;
}
