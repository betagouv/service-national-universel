import { DesisterClasses } from "@admin/core/referentiel/classe/useCase/DesisterClasses";
import { ImporterClasses } from "@admin/core/referentiel/classe/useCase/ImporterClasses";
import {
    ReferentielImportTaskModel,
    ReferentielImportTaskResult,
} from "@admin/core/referentiel/routes/ReferentielImportTask.model";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";
import { Inject, Injectable } from "@nestjs/common";
import { TaskGateway } from "@task/core/Task.gateway";
import { ReferentielTaskType } from "snu-lib";
@Injectable()
export class ReferentielTaskService {
    constructor(
        private readonly importerRoutes: ImporterRoutes,
        private readonly importerClasses: ImporterClasses,
        private readonly desisterClasses: DesisterClasses,
    ) {}
    async handleImporterReferentiel(importTask: ReferentielImportTaskModel): Promise<ReferentielImportTaskResult> {
        switch (importTask.metadata?.parameters?.type) {
            case ReferentielTaskType.IMPORT_ROUTES:
                await this.importerRoutes.execute(importTask.metadata!.parameters!);
                return { rapportKey: "" };
            case ReferentielTaskType.IMPORT_CLASSES:
                const rapportKey = await this.importerClasses.execute(importTask.metadata!.parameters!);
                return { rapportKey };
            case ReferentielTaskType.IMPORT_DESISTER_CLASSES:
                const rapportDesisterKey = await this.desisterClasses.execute(importTask.metadata!.parameters!);
                return { rapportKey: rapportDesisterKey };
            case ReferentielTaskType.IMPORT_DESISTER_CLASSES_ET_IMPORTER_CLASSES:
                const rapportDesisterBeforeKey = await this.desisterClasses.execute(importTask.metadata!.parameters!);
                const rapportImporterKey = await this.importerClasses.execute(importTask.metadata!.parameters!);
                return { rapportKey: "" };
            default:
                throw new Error(`Task of type ${importTask.metadata?.parameters?.type} not handle yet`);
        }
    }
}
