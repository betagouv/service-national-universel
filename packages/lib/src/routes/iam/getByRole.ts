import { ReferentForListDto } from "src/dto";
import { ROLES } from "src/roles";
import { BasicRoute, RouteResponseBodyV2 } from "..";

export interface GetByRoleRoute extends BasicRoute {
  method: "GET";
  path: "/referent";
  query: {
    role: (typeof ROLES)[keyof typeof ROLES];
    search: string;
  };
  response: RouteResponseBodyV2<ReferentForListDto[]>;
}
