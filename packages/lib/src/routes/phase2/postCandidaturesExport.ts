import { BasicRoute, RouteResponseBodyV2 } from "../..";
import { ExportMissionCandidaturesTaskDto } from "../../dto/phase2/mission/ExportMissionCandidaturesTaskDto";

export interface PostCandidaturesExportRoute extends BasicRoute {
  method: "POST";
  path: "/mission/candidatures/export";
  payload: {
    filters: Record<string, string | string[]>;
    fields: string[];
    searchTerm?: string;
  };
  response: RouteResponseBodyV2<ExportMissionCandidaturesTaskDto>;
}
