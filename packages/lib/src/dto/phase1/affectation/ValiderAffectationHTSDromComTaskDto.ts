import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface ValiderAffectationHTSDromComTaskParameters extends Phase1TaskParameters {
  simulationTaskId: string;
}

export type ValiderAffectationHTSDromComTaskResult = {
  rapportKey: string;
  jeunesAffected: number;
  errors: number;
};

export interface ValiderAffectationHTSDromComTaskDto extends TaskDto<ValiderAffectationHTSDromComTaskParameters, ValiderAffectationHTSDromComTaskResult> {}
