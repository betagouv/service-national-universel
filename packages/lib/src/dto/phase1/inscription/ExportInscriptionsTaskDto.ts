import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

type Analytics = {
  erreurs: number;
};

export interface ExportInscriptionsTaskParameters extends Omit<Phase1TaskParameters, "sessionId"> {
  filters: Record<string, string | string[]>;
  fields: string[];
  searchTerm?: string;
}

export type ExportInscriptionsTaskResult = Analytics & {
  rapportKey: string;
};

export interface ExportInscriptionsTaskDto extends TaskDto<ExportInscriptionsTaskParameters, ExportInscriptionsTaskResult> {}
