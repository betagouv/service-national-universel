import { TaskDto } from "../taskDto";

export interface ReferentielImportTaskParameters {
  type: string;
  fileName: string;
  fileKey: string;
  fileLineCount: number;
  auteur: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
    sousRole: string;
  };
}

export type ReferentielImportTaskResult = {
  rapportKey: string;
};

export interface ReferentielImportTaskDto extends TaskDto<ReferentielImportTaskParameters, ReferentielImportTaskResult> {}
