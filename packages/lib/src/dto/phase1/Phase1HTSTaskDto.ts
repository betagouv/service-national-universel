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

export type Phase1TaskHTSTaskResult = {
  rapportKey: string;
  jeunesAffected: number;
};

export interface Phase1HTSTaskDto extends TaskDto<Phase1TaskParameters, Phase1TaskHTSTaskResult> {}
