import { DatabaseModule } from "@infra/Database.module";
import { Logger, Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { ConfigModule } from "@nestjs/config";

import { TaskModule } from "@task/Task.module";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { AdminTaskConsumer } from "./infra/task/AdminTask.consumer";
import { AdminTaskRepository } from "./infra/task/AdminTaskMongo.repository";
import { jeuneMongoProviders } from "./infra/sejours/jeune/provider/JeuneMongo.provider";
import { centreMongoProviders } from "./infra/sejours/phase1/centre/provider/CentreMongo.provider";
import { ligneDeBusMongoProviders } from "./infra/sejours/phase1/ligneDeBus/provider/LigneDeBusMongo.provider";
import { pointDeRassemblementMongoProviders } from "./infra/sejours/phase1/pointDeRassemblement/provider/PointDeRassemblementMongo.provider";
import { sejourMongoProviders } from "./infra/sejours/phase1/sejour/provider/SejourMongo.provider";
import { sessionMongoProviders } from "./infra/sejours/phase1/session/provider/SessionMongo.provider";
import { SimulationAffectationHTS } from "./core/sejours/phase1/affectation/SimulationAffectationHTS";
import { SimulationAffectationHTSService } from "./core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { gatewayProviders as phase1GatewayProviders } from "./infra/sejours/phase1/initProvider/gateway";
import { gatewayProviders as jeuneGatewayProviders } from "./infra/sejours/jeune/initProvider/gateway";
import { FileProvider } from "@shared/infra/File.provider";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { useCaseProvider as referentielUseCaseProvider } from "./infra/referentiel/initProvider/useCase";
import { AffectationService } from "./core/sejours/phase1/affectation/Affectation.service";
import { ValiderAffectationHTS } from "./core/sejours/phase1/affectation/ValiderAffectationHTS";
import { planDeTransportMongoProviders } from "./infra/sejours/phase1/planDeTransport/provider/PlanDeTransportMongo.provider";

import { DATABASE_CONNECTION } from "@infra/Database.provider";
import { ClsPluginTransactional } from "@nestjs-cls/transactional";
import { TransactionalAdapterMongoose } from "@infra/TransactionalAdatpterMongoose";
import { historyProvider } from "./infra/history/historyProvider";
import { ReferentielTaskService } from "./infra/task/ReferentielTask.service";
import { ClasseGateway } from "./core/sejours/cle/classe/Classe.gateway";
import { ClasseRepository } from "./infra/sejours/cle/classe/repository/mongo/ClasseMongo.repository";
import { classeMongoProviders } from "./infra/sejours/cle/classe/provider/ClasseMongo.provider";
import { ImporterRoutes } from "./core/referentiel/routes/useCase/ImporterRoutes";
import { ImporterClasses } from "./core/referentiel/classe/useCase/ImporterClasses";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ClockProvider } from "@shared/infra/Clock.provider";

@Module({
    imports: [
        ClsModule.forRoot({
            plugins: [
                new ClsPluginTransactional({
                    imports: [DatabaseModule],
                    adapter: new TransactionalAdapterMongoose({
                        mongooseConnectionToken: DATABASE_CONNECTION,
                    }),
                }),
            ],
        }),
        ConfigModule,
        TaskModule,
        DatabaseModule,
    ],
    providers: [
        Logger,
        AdminTaskConsumer,
        AdminTaskRepository,
        ...jeuneMongoProviders,
        ...centreMongoProviders,
        ...planDeTransportMongoProviders,
        ...ligneDeBusMongoProviders,
        ...pointDeRassemblementMongoProviders,
        ...sejourMongoProviders,
        ...sessionMongoProviders,
        ...taskMongoProviders,
        ...phase1GatewayProviders,
        ...jeuneGatewayProviders,
        ...historyProvider,
        ...classeMongoProviders,
        { provide: FileGateway, useClass: FileProvider },
        { provide: TaskGateway, useClass: AdminTaskRepository },
        { provide: ClasseGateway, useClass: ClasseRepository },
        { provide: ClockGateway, useClass: ClockProvider },
        // add use case here
        AffectationService,
        SimulationAffectationHTSService,
        SimulationAffectationHTS,
        ValiderAffectationHTS,
        // ...referentielUseCaseProvider,
        ImporterRoutes,
        ImporterClasses,
        ReferentielTaskService,
    ],
})
export class AdminJobModule {
    constructor(private logger: Logger) {
        this.logger.log("AdminJobModule has started", "AdminJobModule");
    }
}
