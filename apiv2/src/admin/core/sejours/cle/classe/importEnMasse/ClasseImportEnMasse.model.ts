import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { TaskModel } from "@task/core/Task.model";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS, ReferentielTaskType } from "snu-lib";
import { ReferentModel } from "@admin/core/iam/Referent.model";

export type ImportClasseEnMasseTaskParameters = {
    classeId: string;
    mapping: Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, string> | null;
    fileKey: string;
    auteur: Partial<ReferentModel>;
};

export type ImportClasseEnMasseTaskResults = {};

export type ImportClasseEnMasseTaskModel = TaskModel<ImportClasseEnMasseTaskParameters, ImportClasseEnMasseTaskResults>;

export type JeuneImportEnMasse = Pick<JeuneModel, "nom" | "prenom" | "dateNaissance" | "genre">;

export const PATH_IMPORT_CLASSE_EN_MASSE = "/file/admin/sejours/phase1/import-classe-en-masse";
