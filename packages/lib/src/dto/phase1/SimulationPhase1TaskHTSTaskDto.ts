import { TaskDto } from "../taskDto";

export interface SimulationPhase1TaskParameters {
  auteur: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
    sousRole: string;
  };
  sessionId: string;
}

export type SimulationPhase1TaskHTSTaskResult = {
  rapportUrl: string;
};

export interface SimulationPhase1TaskHTSTaskDto extends TaskDto<SimulationPhase1TaskParameters, SimulationPhase1TaskHTSTaskResult> {}
