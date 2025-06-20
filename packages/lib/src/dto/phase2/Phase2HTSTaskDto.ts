import { TaskDto } from "../taskDto";

export interface Phase2TaskParameters {
  auteur: {
    id?: string;
    prenom?: string;
    nom?: string;
    role?: string;
    sousRole?: string;
  };
}

export type Phase2TaskHTSTaskResult = {
  rapportKey: string;
};

export interface Phase2HTSTaskDto extends TaskDto<Phase2TaskParameters, Phase2TaskHTSTaskResult> {}
