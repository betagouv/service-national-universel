import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface ValiderBasculerJeunesValidesTaskParameters extends Phase1TaskParameters {
  affecterPDR: boolean;
}

export type ValiderBasculerJeunesValidesTaskResult = {
  rapportKey: string;
  jeunesUpdated: number;
  errors: number;
};

export interface ValiderBasculerJeunesValidesTaskDto extends TaskDto<ValiderBasculerJeunesValidesTaskParameters, ValiderBasculerJeunesValidesTaskResult> {}
