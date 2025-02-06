import { TaskDto } from "../taskDto";

export interface Phase1TaskParameters {
  auteur: {
    id?: string;
    prenom?: string;
    nom?: string;
    role?: string;
    sousRole?: string;
  };
  sessionId: string;
  simulationTaskId?: string; // traitement
}

export type Phase1TaskCLETaskResult = {
  rapportKey: string;
};

export interface Phase1CLETaskDto extends TaskDto<Phase1TaskParameters, Phase1TaskCLETaskResult> {}
