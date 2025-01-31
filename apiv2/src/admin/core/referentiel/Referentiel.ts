import { ReferentielTaskType } from "snu-lib";
import { RouteImportFileValidation } from "./routes/ReferentielRoutesModel";
import { RegionAcademiqueImportFileValidation } from "./regionAcademique/RegionAcademique.model";
import { DepartementImportFileValidation } from "./departement/Departement.model";
import { AcademieImportFileValidation } from "./academie/Academie.model";

export interface FileValidation {
    requiredColumns: string[];
    sheetName: string;
}

export const FilePath = {
    [ReferentielTaskType.IMPORT_CLASSES]: "file/si-snu/classes",
    [ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES]: "file/si-snu/regions-academiques",
    [ReferentielTaskType.IMPORT_ROUTES]: "file/si-snu/routes",
    [ReferentielTaskType.IMPORT_DEPARTEMENTS]: "file/si-snu/departements",
    [ReferentielTaskType.IMPORT_ACADEMIES]: "file/si-snu/academies",
}

export const IMPORT_TAB_NAMES =  {
    [ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES]: RegionAcademiqueImportFileValidation.sheetName,
    [ReferentielTaskType.IMPORT_ROUTES]: RouteImportFileValidation.sheetName,
    [ReferentielTaskType.IMPORT_DEPARTEMENTS]: DepartementImportFileValidation.sheetName,
    [ReferentielTaskType.IMPORT_ACADEMIES]: AcademieImportFileValidation.sheetName,
    //[ReferentielTaskType.IMPORT_CLASSES]: ImportClasseFileValidation.sheetName,
}

export const IMPORT_REQUIRED_COLUMN_NAMES = {
    [ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES]: RegionAcademiqueImportFileValidation.requiredColumns,
    [ReferentielTaskType.IMPORT_ROUTES]: RouteImportFileValidation.requiredColumns,
    [ReferentielTaskType.IMPORT_DEPARTEMENTS]: DepartementImportFileValidation.requiredColumns,
    [ReferentielTaskType.IMPORT_ACADEMIES]: AcademieImportFileValidation.requiredColumns,
    //[ReferentielTaskType.IMPORT_CLASSES]: ImportClasseFileValidation.requiredColumns,
};
