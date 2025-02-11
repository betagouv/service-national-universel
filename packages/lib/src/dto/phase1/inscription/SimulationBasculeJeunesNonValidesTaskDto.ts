import { YoungDto } from "../../youngDto";
import { GRADES } from "../../../constants/constants";
import { TaskDto } from "../../taskDto";
import { Phase1TaskParameters } from "../Phase1HTSTaskDto";

export interface SimulationBasculeJeunesNonValidesTaskParameters extends Phase1TaskParameters {
  status: YoungDto["status"][];
  niveauScolaires: Array<keyof typeof GRADES>;
  departements: string[];
  etranger: boolean;
  sansDepartement: boolean;
  avenir: boolean;
}

export type SimulationBasculeJeunesNonValidesTaskResult = {
  rapportKey: string;
  jeunesAvenir: number;
  jeunesProchainSejour: number;
};

export interface SimulationBasculeJeunesNonValidesTaskDto extends TaskDto<SimulationBasculeJeunesNonValidesTaskParameters, SimulationBasculeJeunesNonValidesTaskResult> {}
