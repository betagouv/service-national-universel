import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@infra/Database.module";
import { JwtAuthModule } from "@infra/JwtAuth.module";
import { QueueModule } from "@infra/Queue.module";
import { Logger, MiddlewareConsumer, Module, RequestMethod, forwardRef } from "@nestjs/common";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ContactProducer } from "@notification/infra/email/Contact.producer";
import { NotificationProducer } from "@notification/infra/Notification.producer";
import { NotificationModule } from "@notification/Notification.module";
import { TaskGateway } from "@task/core/Task.gateway";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { TaskModule } from "@task/Task.module";
import { ClsMiddleware, ClsModule } from "nestjs-cls";
import { SigninReferent } from "./core/iam/useCase/SigninReferent";
import { ClasseService } from "./core/sejours/cle/classe/Classe.service";
import { AuthController } from "./infra/iam/api/Auth.controller";
import { AddUserToRequestMiddleware } from "./infra/iam/auth/AddUserToRequest.middleware";
import { AuthProvider } from "./infra/iam/auth/Auth.provider";
import { JwtTokenService } from "./infra/iam/auth/JwtToken.service";
import { ContactGateway } from "./infra/iam/Contact.gateway";
import { REFERENT_MONGOOSE_ENTITY, referentMongoProviders } from "./infra/iam/provider/ReferentMongo.provider";
import { ClasseController } from "./infra/sejours/cle/classe/api/Classe.controller";
import { CLASSE_MONGOOSE_ENTITY, classeMongoProviders } from "./infra/sejours/cle/classe/provider/ClasseMongo.provider";
import {
    ETABLISSEMENT_MONGOOSE_ENTITY,
    etablissementMongoProviders,
} from "./infra/sejours/cle/etablissement/provider/EtablissementMongo.provider";
import { gatewayProviders as cleGatewayProviders } from "./infra/sejours/cle/initProvider/gateway";
import { gatewayProviders as phase1GatewayProviders } from "./infra/sejours/phase1/initProvider/gateway";
import { gatewayProviders as jeuneGatewayProviders } from "./infra/sejours/jeune/initProvider/gateway";
import { guardProviders } from "./infra/sejours/cle/initProvider/guard";
import { useCaseProvider as cleUseCaseProviders } from "@admin/infra/sejours/cle/initProvider/useCase";
import { useCaseProvider as phase1UseCaseProviders } from "@admin/infra/sejours/phase1/initProvider/useCase";
import { AdminTaskRepository } from "./infra/task/AdminTaskMongo.repository";
import { AdminTaskController } from "./infra/task/api/AdminTask.controller";
import { Phase1Controller } from "./infra/sejours/phase1/api/Phase1.controller";
import { AffectationController } from "./infra/sejours/phase1/affectation/api/Affectation.controller";
import { SimulationAffectationCLEService } from "./core/sejours/phase1/affectation/SimulationAffectationCLE.service";
import { SimulationAffectationHTSService } from "./core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { jeuneMongoProviders } from "./infra/sejours/jeune/provider/JeuneMongo.provider";
import { centreMongoProviders } from "./infra/sejours/phase1/centre/provider/CentreMongo.provider";
import { ligneDeBusMongoProviders } from "./infra/sejours/phase1/ligneDeBus/provider/LigneDeBusMongo.provider";
import { pointDeRassemblementMongoProviders } from "./infra/sejours/phase1/pointDeRassemblement/provider/PointDeRassemblementMongo.provider";
import { sejourMongoProviders } from "./infra/sejours/phase1/sejour/provider/SejourMongo.provider";
import { sessionMongoProviders } from "./infra/sejours/phase1/session/provider/SessionMongo.provider";
import { FileGateway } from "@shared/core/File.gateway";
import { FileProvider } from "@shared/infra/File.provider";
import { referentielUseCaseProviders } from "./infra/referentiel/initProvider/useCase";
import { HistoryController } from "./infra/history/api/History.controller";
import { historyProvider } from "./infra/history/historyProvider";
import { serviceProvider } from "./infra/iam/service/serviceProvider";
import { ReferentController } from "./infra/iam/api/Referent.controller";
import { AffectationService } from "./core/sejours/phase1/affectation/Affectation.service";
import { planDeTransportMongoProviders } from "./infra/sejours/phase1/planDeTransport/provider/PlanDeTransportMongo.provider";

import { ClsPluginTransactional } from "@nestjs-cls/transactional";

import { DATABASE_CONNECTION } from "@infra/Database.provider";
import { TransactionalAdapterMongoose } from "@infra/TransactionalAdatpterMongoose";
import { ReferentielModule } from "./infra/referentiel/ReferentielModule";
import { segmentDeLigneMongoProviders } from "./infra/sejours/phase1/segmentDeLigne/provider/SegmentDeLigneMongo.provider";
import { demandeModificationLigneDeBusMongoProviders } from "./infra/sejours/phase1/demandeModificationLigneDeBus/provider/DemandeModificationLigneDeBusMongo.provider";
import { BasculeJeuneValidesController } from "./infra/sejours/phase1/inscription/api/BasculeJeuneValides.controller";
import { InscriptionService } from "./core/sejours/phase1/inscription/Inscription.service";
import { BasculeJeuneNonValidesController } from "./infra/sejours/phase1/inscription/api/BasculeJeuneNonValides.controller";
import { DesistementController } from "./infra/sejours/phase1/desistement/api/Desistement.controller";
import { DesistementService } from "./core/sejours/phase1/desistement/Desistement.service";
import { ValiderDesisterPostAffectation } from "./core/sejours/phase1/desistement/ValiderDesisterPostAffectation";
import { Phase1Service } from "./core/sejours/phase1/Phase1.service";
import { ValidationInscriptionEnMasseClasse } from "./core/sejours/cle/classe/importEnMasse/useCase/ValidationInscriptionEnMasseClasse";
import { AuthModule } from "../auth/Auth.module";
import { FeatureFlagGateway } from "@shared/core/featureFlag/FeatureFlag.gateway";
import { FeatureFlagMongoRepository } from "@shared/infra/featureFlag/FeatureFlagMongo.repository";
import { featureFlagMongoProviders } from "@shared/infra/featureFlag/FeatureFlag.provider";
import { FeatureFlagService } from "@shared/core/featureFlag/FeatureFlag.service";
import { ClasseImportService } from "./core/sejours/cle/classe/importEnMasse/ClasseImportEnMasse.service";
import { InscrireEleveManuellement } from "./core/sejours/cle/classe/useCase/InscrireEleveManuellement";
import { JeuneService } from "./core/sejours/jeune/Jeune.service";
import { MissionController } from "./infra/engagement/mission/api/Mission.controller";
import { SharedModule } from "@shared/Shared.module";
import { AllExceptionsFilter } from "@shared/infra/AllExceptions.filter";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { InscriptionController } from "./infra/sejours/phase1/inscription/api/Inscription.controller";
import { JeuneController } from "./infra/sejours/phase1/api/Jeune.controller";
import { ExporterJeuneService } from "./core/sejours/phase1/jeune/ExporterJeune.service";
import { PermissionGuard } from "@auth/infra/guard/Permissions.guard";

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
        DatabaseModule,
        JwtAuthModule,
        NotificationModule,
        QueueModule,
        TaskModule,
        ReferentielModule,
        AuthModule,
        SharedModule,
    ],
    controllers: [
        ClasseController,
        AffectationController,
        BasculeJeuneValidesController,
        BasculeJeuneNonValidesController,
        Phase1Controller,
        AuthController,
        AdminTaskController,
        HistoryController,
        ReferentController,
        DesistementController,
        InscriptionController,
        MissionController,
        JeuneController,
    ],
    providers: [
        ClasseService,
        Phase1Service,
        AffectationService,
        InscriptionService,
        SimulationAffectationHTSService,
        SimulationAffectationCLEService,
        DesistementService,
        ValiderDesisterPostAffectation,
        ValidationInscriptionEnMasseClasse,
        ExporterJeuneService,
        AdminTaskRepository,
        { provide: AuthProvider, useClass: JwtTokenService },
        ...classeMongoProviders,
        ...referentMongoProviders,
        ...etablissementMongoProviders,
        ...jeuneMongoProviders,
        ...centreMongoProviders,
        ...planDeTransportMongoProviders,
        ...ligneDeBusMongoProviders,
        ...segmentDeLigneMongoProviders,
        ...demandeModificationLigneDeBusMongoProviders,
        ...pointDeRassemblementMongoProviders,
        ...sejourMongoProviders,
        ...sessionMongoProviders,
        ...guardProviders,
        ...taskMongoProviders,
        ...historyProvider,
        Logger,
        SigninReferent,
        { provide: FileGateway, useClass: FileProvider },
        { provide: FeatureFlagGateway, useClass: FeatureFlagMongoRepository },
        { provide: NotificationGateway, useClass: NotificationProducer },
        { provide: ContactGateway, useClass: ContactProducer },
        { provide: TaskGateway, useClass: AdminTaskRepository },
        ...cleUseCaseProviders,
        ...phase1UseCaseProviders,
        ...cleGatewayProviders,
        ...phase1GatewayProviders,
        ...jeuneGatewayProviders,
        ...referentielUseCaseProviders,
        ...serviceProvider,
        ...featureFlagMongoProviders,
        FeatureFlagService,
        ClasseImportService,
        JeuneService,
        InscrireEleveManuellement,
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
    exports: [
        ClsModule,
        ETABLISSEMENT_MONGOOSE_ENTITY,
        CLASSE_MONGOOSE_ENTITY,
        REFERENT_MONGOOSE_ENTITY,
        ...cleGatewayProviders,
        ...phase1GatewayProviders,
    ],
})
export class AdminModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ClsMiddleware).forRoutes("{*cls}");
        consumer
            .apply(AddUserToRequestMiddleware)
            .exclude({ path: "/referent/signin", method: RequestMethod.POST })
            .exclude({ path: "/classe/public/:id", method: RequestMethod.GET })
            .exclude({ path: "/plan-marketing/import/webhook", method: RequestMethod.POST })
            .exclude({ path: "/", method: RequestMethod.GET })
            .exclude({ path: "/testsentry", method: RequestMethod.GET })
            .exclude({ path: "/queues/*queues", method: RequestMethod.GET })
            .exclude({ path: "/queues/*queues/retry/*retry", method: RequestMethod.PUT })
            .exclude({ path: "/queues/*queues/clean", method: RequestMethod.PUT })
            .forRoutes("{*all}");
    }
}
