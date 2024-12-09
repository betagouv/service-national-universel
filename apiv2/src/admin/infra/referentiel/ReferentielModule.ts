import { RegionAcademiqueImportService } from "@admin/core/referentiel/regionAcademique/ReferentielRegionAcademiqueImport.service";
import { Module } from "@nestjs/common";
import { TaskModule } from "@task/Task.module";
import { ImportReferentielController } from "./api/ImportReferentiel.controller";
import { ReferentielImportTaskService } from "@admin/core/referentiel/ReferentielImportTask.service";
import { referentielGatewayProviders } from "./initProvider/gateway";
import { referentielUseCaseProviders } from "./initProvider/useCase";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskRepository } from "@task/infra/TaskMongo.repository";
import { DatabaseModule } from "@infra/Database.module";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { FileProvider } from "@shared/infra/File.provider";
import { FileGateway } from "@shared/core/File.gateway";
import { ConfigModule } from "@nestjs/config";
import { regionAcademiqueMongoProviders } from "./regionAcademique/RegionAcademiqueMongo.provider";
import { ImportRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImportRegionsAcademiques";

@Module({
    imports: [DatabaseModule, TaskModule, ConfigModule],
    controllers: [ImportReferentielController],
    providers: [
        ...taskMongoProviders,
        { provide: TaskGateway, useClass: TaskRepository },
        { provide: FileGateway, useClass: FileProvider },
        RegionAcademiqueImportService,
         ReferentielImportTaskService,
         ...regionAcademiqueMongoProviders,
         ...referentielGatewayProviders,
         ...referentielUseCaseProviders
        ],
    exports: [ImportRegionsAcademiques],
})

export class ReferentielModule {}

