import { YoungDto } from "../../youngDto";
import { GRADES } from "../../../constants/constants";
import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface SimulationBasculerJeunesValidesTaskParameters extends Phase1TaskParameters {
  status: YoungDto["status"][];
  statusPhase1: YoungDto["statusPhase1"][];
  statusPhase1Motif: YoungDto["statusPhase1Motif"][];
  cohesionStayPresence: boolean;
  niveauScolaires: Array<keyof typeof GRADES>;
  departements: string[];
  etranger: boolean;
  avenir: boolean;
}

export type SimulationBasculerJeunesValidesTaskResult = {
  rapportKey: string;
  jeunesAvenir: number;
  jeunesProchainSejour: number;
};

export interface SimulationBasculerJeunesValidesTaskDto extends TaskDto<SimulationBasculerJeunesValidesTaskParameters, SimulationBasculerJeunesValidesTaskResult> {}
