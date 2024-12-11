import { GRADES } from "../../../constants/constants";
import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface RatioRepartition {
  male: number;
  qvp: number;
  psh: number;
}

export type Analytics = {
  selectedCost: number;
  jeunesNouvellementAffected: number;
  jeuneAttenteAffectation: number;
  jeunesDejaAffected: number;
};

export interface SimulationAffectationHTSTaskParameters extends Phase1TaskParameters {
  departements: string[];
  niveauScolaires: Array<keyof typeof GRADES>;
  sdrImportId: string;
  etranger?: boolean;
  affecterPDR?: boolean;
}

export type SimulationAffectationHTSTaskResult = Analytics & {
  rapportKey: string;
};

export interface SimulationAffectationHTSTaskDto extends TaskDto<SimulationAffectationHTSTaskParameters, SimulationAffectationHTSTaskResult> {}
