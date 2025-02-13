import { EtablissementType, ReferentType } from "../../../mongoSchema";
import { BasicRoute, RouteResponseBody } from "../..";

export interface GetOneEtablissementRoute extends BasicRoute {
  method: "GET";
  path: "/cle/etablissement/{id}";
  params: { id: string };
  query?: {
    withDetails?: boolean;
  };
  response: RouteResponseBody<
    EtablissementType & {
      coordinateurs?: Pick<ReferentType, "_id" | "email" | "firstName" | "lastName" | "phone" | "role" | "subRole">[];
    }
  >;
}
