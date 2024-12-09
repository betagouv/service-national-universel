import { BasicRoute, ReferentielImportTaskDto, RouteResponseBodyV2 } from "../..";

export interface ImportReferentiel extends BasicRoute {
  method: "POST";
  path: "/referentiel/import/{name}";
  params: {
    name: string;
  };
  payload: File;
  response: RouteResponseBodyV2<ReferentielImportTaskDto>;
}