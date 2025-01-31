import { ReferentielService } from "@admin/core/referentiel/Referentiel.service";
import { ReferentielImportTaskService } from "@admin/core/referentiel/ReferentielImportTask.service";
import { AcademieImportService } from "@admin/core/referentiel/academie/AcademieImport.service";
import { ReferentielClasseService } from "@admin/core/referentiel/classe/ReferentielClasse.service";
import { DepartementImportService } from "@admin/core/referentiel/departement/DepartementImport.service";
import { RegionAcademiqueImportService } from "@admin/core/referentiel/regionAcademique/RegionAcademiqueImport.service";

export const referentielServiceProvider = [
    ReferentielClasseService,
    ReferentielService,
    DepartementImportService,
    RegionAcademiqueImportService,
    ReferentielImportTaskService,
    AcademieImportService,
];
