import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface DesisterTaskParameters extends Phase1TaskParameters {
  affectationTaskId: string;
  // TODO en v2: filtrer par département, région, etc.
}

export type DesisterTaskResult = {
  jeunesDesistes: number;
  jeunesAutreSession: number;
  jeunesConfirmes: number;
  jeunesNonConfirmes: number;
  rapportKey?: string;
  jeunesModifies?: number;
};

export interface DesistementTaskDto extends TaskDto<DesisterTaskParameters, DesisterTaskResult> {}
