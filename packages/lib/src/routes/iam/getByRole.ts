import { BasicRoute, RouteResponseBodyV2 } from "..";
import { ReferentForListDto } from "../../dto";
import { ROLES } from "../../roles";

export interface GetByRoleRoute extends BasicRoute {
  method: "GET";
  path: "/referent";
  query: {
    role: (typeof ROLES)[keyof typeof ROLES];
    search: string;
  };
  response: RouteResponseBodyV2<ReferentForListDto[]>;
}
