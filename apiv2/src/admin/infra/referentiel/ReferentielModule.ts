import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClsModule } from "nestjs-cls";

import { DatabaseModule } from "@infra/Database.module";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { NotificationProducer } from "@notification/infra/Notification.producer";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockProvider } from "@shared/infra/Clock.provider";
import { FileProvider } from "@shared/infra/File.provider";
import { TaskGateway } from "@task/core/Task.gateway";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { ImporterAcademies } from "@admin/core/referentiel/academie/useCase/ImporterAcademies/ImporterAcademies";
import { ImporterDepartements } from "@admin/core/referentiel/departement/useCase/ImporterDepartements/ImporterDepartements";
import { ImporterRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImporterRegionsAcademiques/ImporterRegionsAcademiques";

import { AdminTaskRepository } from "../task/AdminTaskMongo.repository";
import { academieMongoProviders } from "./academie/Academie.provider";
import { ImportReferentielController } from "./api/ImportReferentiel.controller";
import { departementMongoProviders } from "./departement/DepartementMongo.provider";
import { referentielGatewayProviders } from "./initProvider/gateway";
import { referentielServiceProvider } from "./initProvider/service";
import { referentielUseCaseProviders } from "./initProvider/useCase";
import { regionAcademiqueMongoProviders } from "./regionAcademique/RegionAcademiqueMongo.provider";

// Les imports phase 1 (classes CLE, routes) et leurs dépendances (sessions, séjours, centres,
// points de rassemblement, lignes de bus, jeunes, désistement, affectation) sont supprimés :
// le module ne porte plus que les référentiels géographiques.
@Module({
    imports: [DatabaseModule, ConfigModule, ClsModule],
    controllers: [ImportReferentielController],
    providers: [
        ...taskMongoProviders,
        { provide: TaskGateway, useClass: AdminTaskRepository },
        { provide: FileGateway, useClass: FileProvider },
        { provide: ClockGateway, useClass: ClockProvider },
        { provide: NotificationGateway, useClass: NotificationProducer },
        ...referentielGatewayProviders,
        ...referentielUseCaseProviders,
        ...regionAcademiqueMongoProviders,
        ...departementMongoProviders,
        ...academieMongoProviders,
        ...referentielServiceProvider,
        Logger,
    ],
    exports: [
        ImporterRegionsAcademiques,
        ImporterDepartements,
        ImporterAcademies,
        ...referentielServiceProvider,
        ...referentielGatewayProviders,
    ],
})
export class ReferentielModule {}
