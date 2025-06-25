import { ExportJeunesTaskDto } from "../../../dto";
import { BasicRoute, RouteResponseBodyV2 } from "../..";

export interface PostJeunesExportRoute extends BasicRoute {
  method: "POST";
  path: "/jeune/export";
  payload: {
    filters: Record<string, string | string[]>;
    fields: string[];
    searchTerm?: string;
  };
  response: RouteResponseBodyV2<ExportJeunesTaskDto>;
}
