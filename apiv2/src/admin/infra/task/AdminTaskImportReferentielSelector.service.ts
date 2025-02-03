import { ReferentielClasseService } from "@admin/core/referentiel/classe/ReferentielClasse.service";
import { DesisterClasses } from "@admin/core/referentiel/classe/useCase/DesisterClasses";
import { ImporterClasses } from "@admin/core/referentiel/classe/useCase/ImporterClasses";
import {
    ReferentielImportTaskModel,
    ReferentielImportTaskResult,
} from "@admin/core/referentiel/routes/ReferentielImportTask.model";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";
import { Injectable } from "@nestjs/common";
import { ReferentielTaskType } from "snu-lib";
@Injectable()
export class AdminTaskImportReferentielSelectorService {
    constructor(
        private readonly importerRoutes: ImporterRoutes,
        private readonly importerClasses: ImporterClasses,
        private readonly desisterClasses: DesisterClasses,
        private readonly referentielClasseService: ReferentielClasseService,
    ) {}
    async handleImporterReferentiel(importTask: ReferentielImportTaskModel): Promise<ReferentielImportTaskResult> {
        const taskParameters = importTask.metadata!.parameters;
        switch (taskParameters?.type) {
            case ReferentielTaskType.IMPORT_ROUTES:
                await this.importerRoutes.execute(taskParameters);
                return { rapportKey: "" };
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
