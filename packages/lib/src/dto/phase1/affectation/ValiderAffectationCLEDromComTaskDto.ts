import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1CLETaskDto";

export interface ValiderAffectationCLEDromComTaskParameters extends Phase1TaskParameters {
  simulationTaskId: string;
}

export type ValiderAffectationCLEDromComTaskResult = {
  rapportKey: string;
  jeunesAffected: number;
  errors: number;
};

export interface ValiderAffectationCLEDromComTaskDto extends TaskDto<ValiderAffectationCLEDromComTaskParameters, ValiderAffectationCLEDromComTaskResult> {}
