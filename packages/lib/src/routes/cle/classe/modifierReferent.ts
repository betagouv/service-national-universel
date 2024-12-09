import { ModifierReferentDto } from "src/dto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface ModifierReferentClasseRoute extends BasicRoute {
  method: "POST";
  path: "/classe/{id}/referent/modifier-ou-creer";
  params: {
    id: string;
  };
  payload: ModifierReferentDto;
  response: RouteResponseBodyV2<ModifierReferentDto>;
}
