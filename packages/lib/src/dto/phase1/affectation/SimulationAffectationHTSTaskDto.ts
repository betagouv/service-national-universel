import { GRADES } from "../../../constants/constants";
import { TaskDto } from "../../taskDto";
import { SimulationPhase1TaskParameters } from "../../phase1/SimulationPhase1TaskHTSTaskDto";

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

export interface SimulationAffectationHTSTaskParameters extends SimulationPhase1TaskParameters {
  departements: string[];
  niveauScolaires: Array<keyof typeof GRADES>;
  changementDepartements: { origine: string; destination: string }[];
  etranger?: boolean;
  affecterPDR?: boolean;
}

export type SimulationAffectationHTSTaskResult = Analytics & {
  rapportUrl: string;
};

export interface SimulationAffectationHTSTaskDto extends TaskDto<SimulationAffectationHTSTaskParameters, SimulationAffectationHTSTaskResult> {}
