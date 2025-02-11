import { YoungDto } from "../../youngDto";
import { GRADES } from "../../../constants/constants";
import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface SimulationBasculeJeunesValidesTaskParameters extends Phase1TaskParameters {
  status: YoungDto["status"][];
  statusPhase1: YoungDto["statusPhase1"][];
  statusPhase1Motif: YoungDto["statusPhase1Motif"][];
  presenceArrivee: Array<boolean | null>;
  niveauScolaires: Array<keyof typeof GRADES>;
  departements: string[];
  etranger: boolean;
  sansDepartement: boolean;
  avenir: boolean;
}

export type SimulationBasculeJeunesValidesTaskResult = {
  rapportKey: string;
  jeunesAvenir: number;
  jeunesProchainSejour: number;
};

export interface SimulationBasculeJeunesValidesTaskDto extends TaskDto<SimulationBasculeJeunesValidesTaskParameters, SimulationBasculeJeunesValidesTaskResult> {}
