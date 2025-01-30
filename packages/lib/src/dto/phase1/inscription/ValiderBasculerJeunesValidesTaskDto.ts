import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface ValiderBasculeJeunesValidesTaskParameters extends Phase1TaskParameters {
  sendEmail: boolean;
}

export type ValiderBasculeJeunesValidesTaskResult = {
  jeunesBascules: number;
  jeunesRefuses: number;
  errors: number;
};

export interface ValiderBasculerJeunesValidesTaskDto extends TaskDto<ValiderBasculeJeunesValidesTaskParameters, ValiderBasculeJeunesValidesTaskResult> {}
