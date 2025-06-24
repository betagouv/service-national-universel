import { TaskDto } from "../../taskDto";
import { Phase2TaskParameters } from "../Phase2HTSTaskDto";

type Analytics = {
  erreurs: number;
};

export interface ExportMissionsTaskParameters extends Phase2TaskParameters {
  filters: Record<string, string | string[]>;
  fields: string[];
  searchTerm?: string;
}

export type ExportMissionsTaskResult = Analytics & {
  rapportKey: string;
};

export interface ExportMissionsTaskDto extends TaskDto<ExportMissionsTaskParameters, ExportMissionsTaskResult> {}
