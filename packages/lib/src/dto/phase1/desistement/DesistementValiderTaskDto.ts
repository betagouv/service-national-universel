import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface DesisterValiderTaskParameters extends Phase1TaskParameters {
  affectationTaskId: string;
  // TODO en v2: filtrer par département, région, etc.
}

export type DesisterValiderTaskResult = {
  jeunesDesistes: number;
  jeunesAutreSession: number;
  jeunesConfirmes: number;
  jeunesNonConfirmes: number;
  rapportKey?: string;
  jeunesModifies?: number;
};

export interface DesistementValiderTaskDto extends TaskDto<DesisterValiderTaskParameters, DesisterValiderTaskResult> {}
