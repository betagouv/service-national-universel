import { ReferentielTaskType } from "snu-lib";
import { RegionAcademiqueImportFileValidation } from "./regionAcademique/RegionAcademique.model";
import { DepartementImportFileValidation } from "./departement/Departement.model";
import { AcademieImportFileValidation } from "./academie/Academie.model";

export interface FileValidation {
    requiredColumns: string[];
    sheetName: string;
}

// Seuls les référentiels géographiques s'importent encore. Les imports phase 1 (classes CLE vers
// sessions/séjours, routes du schéma de répartition) sont supprimés avec les écritures phase 1.
export const REFERENTIEL_IMPORT_TYPES = [
    ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES,
    ReferentielTaskType.IMPORT_DEPARTEMENTS,
    ReferentielTaskType.IMPORT_ACADEMIES,
] as const;

export type ReferentielImportType = (typeof REFERENTIEL_IMPORT_TYPES)[number];

export const isReferentielImportType = (name: string): name is ReferentielImportType =>
    (REFERENTIEL_IMPORT_TYPES as readonly string[]).includes(name);

export const FilePath: Record<ReferentielImportType, string> = {
    [ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES]: "file/si-snu/regions-academiques",
    [ReferentielTaskType.IMPORT_DEPARTEMENTS]: "file/si-snu/departements",
    [ReferentielTaskType.IMPORT_ACADEMIES]: "file/si-snu/academies",
};

export const IMPORT_TAB_NAMES: Record<ReferentielImportType, string> = {
    [ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES]: RegionAcademiqueImportFileValidation.sheetName,
    [ReferentielTaskType.IMPORT_DEPARTEMENTS]: DepartementImportFileValidation.sheetName,
    [ReferentielTaskType.IMPORT_ACADEMIES]: AcademieImportFileValidation.sheetName,
};

export const IMPORT_REQUIRED_COLUMN_NAMES: Record<ReferentielImportType, string[]> = {
    [ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES]: RegionAcademiqueImportFileValidation.requiredColumns,
    [ReferentielTaskType.IMPORT_DEPARTEMENTS]: DepartementImportFileValidation.requiredColumns,
    [ReferentielTaskType.IMPORT_ACADEMIES]: AcademieImportFileValidation.requiredColumns,
};
