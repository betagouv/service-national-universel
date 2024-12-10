import { RegionAcademiqueImportService } from "@admin/core/referentiel/regionAcademique/RegionAcademiqueImport.service";
import { Module } from "@nestjs/common";
import { ImportReferentielController } from "./api/ImportReferentiel.controller";
import { ReferentielImportTaskService } from "@admin/core/referentiel/ReferentielImportTask.service";
import { referentielGatewayProviders } from "./initProvider/gateway";
import { referentielUseCaseProviders } from "./initProvider/useCase";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskRepository } from "@task/infra/TaskMongo.repository";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { FileProvider } from "@shared/infra/File.provider";
import { FileGateway } from "@shared/core/File.gateway";
import { regionAcademiqueMongoProviders } from "./regionAcademique/RegionAcademiqueMongo.provider";
import { ImportRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImportRegionsAcademiques";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";

@Module({
    imports: [],
    controllers: [ImportReferentielController],
    providers: [
        ...taskMongoProviders,
        { provide: TaskGateway, useClass: TaskRepository },
        { provide: FileGateway, useClass: FileProvider },
        RegionAcademiqueImportService,
        ReferentielImportTaskService,
        ...referentielGatewayProviders,
        ...referentielUseCaseProviders,
        ...regionAcademiqueMongoProviders,
        ],
    exports: [ImportRegionsAcademiques, ImporterRoutes],
})

export class ReferentielModule {}

