import { ExportJeunesTaskDto } from "../../../dto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface PostInscriptionsExportRoute extends BasicRoute {
  method: "POST";
  path: "/inscription/export";
  payload: {
    filters: Record<string, string | string[]>;
    fields: string[];
    searchTerm?: string;
  };
  response: RouteResponseBodyV2<ExportJeunesTaskDto>;
}
