import { TaskModel } from "@task/core/Task.model";

export interface ReferentielImportTaskAuthor {
    id?: string;
    prenom?: string;
    nom?: string;
    role?: string;
    sousRole?: string;
    email?: string;
}

export interface ReferentielImportTaskParameters {
    type: string;
    fileName: string;
    fileKey: string;
    fileLineCount: number;
    auteur: ReferentielImportTaskAuthor;
    folderPath: string;
}

export type ReferentielImportTaskResult = {
    rapportKey: string;
};

export type ReferentielImportTaskModel = TaskModel<ReferentielImportTaskParameters, ReferentielImportTaskResult>;
export type CreateReferentielImportTaskModel = Omit<ReferentielImportTaskModel, "id" | "createdAt" | "updatedAt">;
