import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

type Analytics = {
  erreurs: number;
};

export interface ExportJeunesTaskParameters extends Omit<Phase1TaskParameters, "sessionId"> {
  name: string;
  format: "volontaire" | "inscription";
  filters: Record<string, string | string[]>;
  fields: string[];
  searchTerm?: string;
  departement?: string;
  region?: string;
}

export type ExportJeunesTaskResult = Analytics & {
  rapportKey: string;
};

export interface ExportJeunesTaskDto extends TaskDto<ExportJeunesTaskParameters, ExportJeunesTaskResult> {}
