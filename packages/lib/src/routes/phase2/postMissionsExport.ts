import { BasicRoute, RouteResponseBodyV2 } from "../..";
import { ExportMissionsTaskDto } from "../../dto/phase2/mission/ExportMissionsTaskDto";

export interface PostMissionsExportRoute extends BasicRoute {
  method: "POST";
  path: "/mission/export";
  payload: {
    filters: Record<string, string | string[]>;
    fields: string[];
    searchTerm?: string;
  };
  response: RouteResponseBodyV2<ExportMissionsTaskDto>;
}
