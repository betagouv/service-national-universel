import { GRADES } from "../../../constants/constants";
import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

type Analytics = {
  jeunesNouvellementAffected: number;
  jeuneAttenteAffectation: number;
  jeunesDejaAffected: number;
};

export interface SimulationAffectationHTSDromComTaskParameters extends Phase1TaskParameters {
  niveauScolaires: Array<keyof typeof GRADES>;
  departements: string[];
  etranger?: boolean;
}

export type SimulationAffectationHTSDromComTaskResult = Analytics & {
  rapportKey: string;
};

export interface SimulationAffectationHTSDromComTaskDto extends TaskDto<SimulationAffectationHTSDromComTaskParameters, SimulationAffectationHTSDromComTaskResult> {}
