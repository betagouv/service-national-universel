import { BasicRoute, RouteResponseBodyV2 } from "..";
import { StructureType } from "../../mongoSchema/structure";

export interface PostFindAll extends BasicRoute {
  method: "POST";
  path: "/structure";
  payload: {
    query: string;
  };
  response: RouteResponseBodyV2<Partial<StructureType & { id: string }>[]>;
}
