import { BasicRoute, ReferentielImportTaskDto, RouteResponseBodyV2 } from "../..";

export interface GetImportsReferentiel extends BasicRoute {
  method: "GET";
  path: "/referentiel/import";
  query: {
    type?: string;
    name?: string;
    limit?: number;
    order?: "ASC" | "DESC";
  };
  response: RouteResponseBodyV2<ReferentielImportTaskDto[]>;
}