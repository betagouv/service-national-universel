import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface ValiderAffectationHTSTaskParameters extends Phase1TaskParameters {
  simulationTaskId: string;
  affecterPDR: boolean;
}

export type ValiderAffectationHTSTaskResult = {
  rapportKey: string;
  jeunesAffected: number;
  errors: number;
};

export interface ValiderAffectationHTSTaskDto extends TaskDto<ValiderAffectationHTSTaskParameters, ValiderAffectationHTSTaskResult> {}
