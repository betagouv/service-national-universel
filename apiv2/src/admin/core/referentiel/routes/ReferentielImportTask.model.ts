import { TaskModel } from "@task/core/Task.model";

export interface ReferentielImportTaskAuthor {
    id?: string;
    prenom?: string;
    nom?: string;
    role?: string;
    sousRole?: string;
}

export interface ReferentielImportTaskParameters {
    type: string;
    fileName: string;
    fileKey: string;
    fileLineCount: number;
    auteur: ReferentielImportTaskAuthor;
}

export type ReferentielImportTaskResult = {
    rapportUrl: string;
    rapportKey: string;
};

export type ReferentielImportTaskModel = TaskModel<ReferentielImportTaskParameters, ReferentielImportTaskResult>;
