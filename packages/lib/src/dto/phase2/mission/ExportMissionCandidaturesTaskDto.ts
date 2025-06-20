import { TaskDto } from "../../taskDto";
import { Phase2TaskParameters } from "../Phase2HTSTaskDto";

type Analytics = {
  erreurs: number;
};

export interface ExportMissionCandidaturesTaskParameters extends Phase2TaskParameters {
  filters: Record<string, string | string[]>;
  fields: string[];
  searchTerm?: string;
}

export type ExportMissionCandidaturesTaskResult = Analytics & {
  rapportKey: string;
};

export interface ExportMissionCandidaturesTaskDto extends TaskDto<ExportMissionCandidaturesTaskParameters, ExportMissionCandidaturesTaskResult> {}
