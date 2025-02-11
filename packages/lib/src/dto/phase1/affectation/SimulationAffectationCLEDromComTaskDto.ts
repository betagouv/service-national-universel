import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

type Analytics = {
  classes: number;
  erreurs: number;
  jeunesAffected: number;
};

export interface SimulationAffectationCLEDromComTaskParameters extends Phase1TaskParameters {
  departements: string[];
  etranger?: boolean;
}

export type SimulationAffectationCLEDromComTaskResult = Analytics & {
  rapportKey: string;
};

export interface SimulationAffectationCLEDromComTaskDto extends TaskDto<SimulationAffectationCLEDromComTaskParameters, SimulationAffectationCLEDromComTaskResult> {}
