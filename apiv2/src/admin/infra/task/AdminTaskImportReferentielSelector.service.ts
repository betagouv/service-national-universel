import { Injectable } from "@nestjs/common";
import { ReferentielTaskType } from "snu-lib";

import {
    ReferentielImportTaskModel,
    ReferentielImportTaskResult,
} from "@admin/core/referentiel/ReferentielImportTask.model";
import { AcademieImportService } from "@admin/core/referentiel/academie/AcademieImport.service";
import { ImporterAcademies } from "@admin/core/referentiel/academie/useCase/ImporterAcademies/ImporterAcademies";
import { DepartementImportService } from "@admin/core/referentiel/departement/DepartementImport.service";
import { ImporterDepartements } from "@admin/core/referentiel/departement/useCase/ImporterDepartements/ImporterDepartements";
import { RegionAcademiqueImportService } from "@admin/core/referentiel/regionAcademique/RegionAcademiqueImport.service";
import { ImporterRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImporterRegionsAcademiques/ImporterRegionsAcademiques";

// Imports phase 1 supprimés : une tâche restée en file avec l'un de ces types échoue explicitement.
export const REFERENTIEL_IMPORT_TYPES_SUPPRIMES: string[] = [
    ReferentielTaskType.IMPORT_ROUTES,
    ReferentielTaskType.IMPORT_CLASSES,
    ReferentielTaskType.IMPORT_DESISTER_CLASSES,
    ReferentielTaskType.IMPORT_DESISTER_CLASSES_ET_IMPORTER_CLASSES,
];

@Injectable()
export class AdminTaskImportReferentielSelectorService {
    constructor(
        private readonly importerRegionsAcademiques: ImporterRegionsAcademiques,
        private readonly regionAcademiqueService: RegionAcademiqueImportService,
        private readonly importerDepartements: ImporterDepartements,
        private readonly departementService: DepartementImportService,
        private readonly importerAcademies: ImporterAcademies,
        private readonly academieService: AcademieImportService,
    ) {}

    async handleImporterReferentiel(importTask: ReferentielImportTaskModel): Promise<ReferentielImportTaskResult> {
        const taskParameters = importTask.metadata!.parameters;
        switch (taskParameters?.type) {
            case ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES: {
                const rapport = await this.importerRegionsAcademiques.execute(taskParameters);
                return { rapportKey: await this.regionAcademiqueService.processReport(taskParameters, rapport) };
            }
            case ReferentielTaskType.IMPORT_DEPARTEMENTS: {
                const rapport = await this.importerDepartements.execute(taskParameters);
                return { rapportKey: await this.departementService.processReport(taskParameters, rapport) };
            }
            case ReferentielTaskType.IMPORT_ACADEMIES: {
                const rapport = await this.importerAcademies.execute(taskParameters);
                return { rapportKey: await this.academieService.processReport(taskParameters, rapport) };
            }
            default:
                if (taskParameters?.type && REFERENTIEL_IMPORT_TYPES_SUPPRIMES.includes(taskParameters.type)) {
                    throw new Error(`Import "${taskParameters.type}" supprimé (écritures phase 1 retirées)`);
                }
                throw new Error(`Task of type ${taskParameters?.type} not handle yet`);
        }
    }
}
