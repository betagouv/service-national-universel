import { ExportJeunesTaskDto } from "../../../dto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface PostJeunesScolariseExportRoute extends BasicRoute {
  method: "POST";
  path: "/jeune/export/scolarises";
  payload: {
    filters: Record<string, string | string[]>;
    fields: string[];
    searchTerm?: string;
    departement?: string[];
    region?: string;
  };
  response: RouteResponseBodyV2<ExportJeunesTaskDto>;
}
