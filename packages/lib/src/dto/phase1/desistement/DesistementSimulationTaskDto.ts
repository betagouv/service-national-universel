import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface DesisterSimulationTaskParameters extends Phase1TaskParameters {
  affectationTaskId: string;
  affectationFileName: string;
  // TODO en v2: filtrer par département, région, etc.
}

export type DesisterSimulationTaskResult = {
  jeunesDesistes: number;
  jeunesAutreSession: number;
  jeunesConfirmes: number;
  jeunesNonConfirmes: number;
  rapportKey?: string;
  jeunesModifies?: number;
};

export interface DesistementSimulationTaskDto extends TaskDto<DesisterSimulationTaskParameters, DesisterSimulationTaskResult> {}
