import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

type Analytics = {
  classes: number;
  erreurs: number;
  jeunesAffected: number;
};

export interface SimulationAffectationCLETaskParameters extends Phase1TaskParameters {
  departements: string[];
  etranger?: boolean;
}

export type SimulationAffectationCLETaskResult = Analytics & {
  rapportKey: string;
};

export interface SimulationAffectationCLETaskDto extends TaskDto<SimulationAffectationCLETaskParameters, SimulationAffectationCLETaskResult> {}
