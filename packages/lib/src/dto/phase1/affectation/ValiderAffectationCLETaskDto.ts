import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1CLETaskDto";

export interface ValiderAffectationCLETaskParameters extends Phase1TaskParameters {
  simulationTaskId: string;
}

export type ValiderAffectationCLETaskResult = {
  rapportKey: string;
  jeunesAffected: number;
  errors: number;
};

export interface ValiderAffectationCLETaskDto extends TaskDto<ValiderAffectationCLETaskParameters, ValiderAffectationCLETaskResult> {}
