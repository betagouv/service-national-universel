import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface ValiderBasculeJeunesNonValidesTaskParameters extends Phase1TaskParameters {
  sendEmail: boolean;
}

export type ValiderBasculeJeunesNonValidesTaskResult = {
  jeunesBascules: number;
  errors: number;
};

export interface ValiderBasculeJeunesNonValidesTaskDto extends TaskDto<ValiderBasculeJeunesNonValidesTaskParameters, ValiderBasculeJeunesNonValidesTaskResult> {}
