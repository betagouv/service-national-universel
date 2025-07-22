import { ExportJeunesTaskDto } from "../../../dto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface PostInscriptionsScolariseExportRoute extends BasicRoute {
  method: "POST";
  path: "/inscription/export/scolarises";
  payload: {
    filters: Record<string, string | string[]>;
    fields: string[];
    searchTerm?: string;
    departement?: string[];
    region?: string;
  };
  response: RouteResponseBodyV2<ExportJeunesTaskDto>;
}
