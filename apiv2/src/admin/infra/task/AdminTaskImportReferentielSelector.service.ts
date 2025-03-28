import { ReferentielClasseService } from "@admin/core/referentiel/classe/ReferentielClasse.service";
import { DesisterClasses } from "@admin/core/referentiel/classe/useCase/DesisterClasses";
import { ImporterClasses } from "@admin/core/referentiel/classe/useCase/ImporterClasses";
import {
    ReferentielImportTaskModel,
    ReferentielImportTaskResult,
} from "@admin/core/referentiel/ReferentielImportTask.model";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";
import { Injectable } from "@nestjs/common";
import { ReferentielTaskType } from "snu-lib";
import { RegionAcademiqueImportService } from "@admin/core/referentiel/regionAcademique/RegionAcademiqueImport.service";
import { ImporterRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImporterRegionsAcademiques/ImporterRegionsAcademiques";
import { ImporterDepartements } from "@admin/core/referentiel/departement/useCase/ImporterDepartements/ImporterDepartements";
import { DepartementImportService } from "@admin/core/referentiel/departement/DepartementImport.service";
import { ImporterAcademies } from "@admin/core/referentiel/academie/useCase/ImporterAcademies/ImporterAcademies";
import { AcademieImportService } from "@admin/core/referentiel/academie/AcademieImport.service";
@Injectable()
export class AdminTaskImportReferentielSelectorService {
    constructor(
        private readonly importerRoutes: ImporterRoutes,
        private readonly importerClasses: ImporterClasses,
        private readonly desisterClasses: DesisterClasses,
        private readonly referentielClasseService: ReferentielClasseService,
        private readonly importerRegionsAcademiques: ImporterRegionsAcademiques,
        private readonly regionAcademiqueService: RegionAcademiqueImportService,
        private readonly importerDepartements: ImporterDepartements,
        private readonly departementService: DepartementImportService,
        private readonly importerAcademies: ImporterAcademies,
        private readonly academieService: AcademieImportService,
    ) { }
    async handleImporterReferentiel(importTask: ReferentielImportTaskModel): Promise<ReferentielImportTaskResult> {
        const taskParameters = importTask.metadata!.parameters;
        switch (taskParameters?.type) {
            case ReferentielTaskType.IMPORT_ROUTES:
                await this.importerRoutes.execute(taskParameters);
                return { rapportKey: "" };
            case ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES:
                const rapportRegionsAcademiques = await this.importerRegionsAcademiques.execute(taskParameters);
                const rapportRegionAcademiqueKey = await this.regionAcademiqueService.processReport(taskParameters, rapportRegionsAcademiques);
                return { rapportKey: rapportRegionAcademiqueKey };
            case ReferentielTaskType.IMPORT_DEPARTEMENTS:
                    const rapportDepartements = await this.importerDepartements.execute(taskParameters);
                    const rapportDepartementsKey = await this.departementService.processReport(taskParameters, rapportDepartements);
                    return { rapportKey: rapportDepartementsKey };
            case ReferentielTaskType.IMPORT_ACADEMIES:
                const rapportAcademies = await this.importerAcademies.execute(taskParameters);
                const rapportAcademiesKey = await this.academieService.processReport(taskParameters, rapportAcademies);
                return { rapportKey: rapportAcademiesKey };
            case ReferentielTaskType.IMPORT_CLASSES:
                const rapport = await this.importerClasses.execute(taskParameters);
                const rapportKey = await this.referentielClasseService.processReport(taskParameters, rapport);
                return { rapportKey };
            case ReferentielTaskType.IMPORT_DESISTER_CLASSES:
                const rapportDesister = await this.desisterClasses.execute(taskParameters);
                const rapportDesisterKey = await this.referentielClasseService.processReport(
                    taskParameters,
                    rapportDesister,
                );
                return { rapportKey: rapportDesisterKey };
            case ReferentielTaskType.IMPORT_DESISTER_CLASSES_ET_IMPORTER_CLASSES:
                const rapportDesisterBeforeImporter = await this.desisterClasses.execute(taskParameters);
                const rapportImporter = await this.importerClasses.execute(taskParameters);
                const rapportDesisterImporterKey = await this.referentielClasseService.processReport(
                    taskParameters,
                    rapportDesisterBeforeImporter,
                    rapportImporter,
                );
                return { rapportKey: rapportDesisterImporterKey };
            default:
                throw new Error(`Task of type ${taskParameters?.type} not handle yet`);
        }
    }
}
