import { Logger, Module } from "@nestjs/common";
import { PlanMarketingController } from "./infra/api/PlanMarketing.controller";
import { ImporterEtCreerListeDiffusion } from "./core/useCase/ImporterEtCreerListeDiffusion";
import { planMarketingFactory } from "./infra/provider/PlanMarketing.factory";
import { ConfigModule } from "@nestjs/config";
import { TaskModule } from "@task/Task.module";
import { AssocierListeDiffusionToCampagne } from "./core/useCase/AssocierListeDiffusionToCampagne";
import { PlanMarketingActionSelectorService } from "./core/PlanMarketingActionSelector.service";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskRepository } from "@task/infra/TaskMongo.repository";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { DatabaseModule } from "@infra/Database.module";
import { FileGateway } from "@shared/core/File.gateway";
import { FileProvider } from "@shared/infra/File.provider";
import { CampagneGateway } from "./core/gateway/Campagne.gateway";
import { CampagneMongoRepository } from "./infra/CampagneMongo.repository";
import { campagneMongoProviders } from "./infra/CampagneMongo.provider";
import { CampagneController } from "./infra/api/Campagne.controller";
import { CampagneService } from "./core/service/Campagne.service";
import { ListeDiffusionController } from "./infra/api/ListeDiffusion.controller";
import { ListeDiffusionService } from "./core/service/ListeDiffusion.service";
import { ListeDiffusionGateway } from "./core/gateway/ListeDiffusion.gateway";
import { ListeDiffusionMongoRepository } from "./infra/ListeDiffusionMongo.repository";
import { listeDiffusionMongoProviders } from "./infra/ListeDiffusion.provider";
import { MettreAJourCampagne } from "./core/useCase/MettreAJourCampagne";
import { CreerListeDiffusion } from "./core/useCase/CreerListeDiffusion";
import { ImporterContacts } from "./core/useCase/ImporterContacts";
import { AnalyticsModule } from "src/analytics/analytics.module";
import { SearchYoungGateway } from "@analytics/core/SearchYoung.gateway";
import { SearchYoungElasticRepository } from "@analytics/infra/SearchYoungElastic.repository";
import { AdminModule } from "@admin/Admin.module";
import { PreparerEnvoiCampagne } from "./core/useCase/PreparerEnvoiCampagne";
import { EnvoyerCampagne } from "./core/useCase/EnvoyerCampagne";
import { CampagneContactBuilderService } from "./core/service/CampagneContactBuilder.service";
import { CampagneProcessorService } from "./core/service/CampagneProcessor.service";
import { CampagneDataFetcherService } from "./core/service/CampagneDataFetcher.service";
import { ProgrammationService } from "./core/service/Programmation.service";
import { EnvoyerCampagneProgrammee } from "./core/useCase/cron/EnvoyerCampagneProgrammee";
import { BasculerArchivageCampagne } from "./core/useCase/BasculerArchivageCampagne";
import { MettreAJourActivationProgrammationSpecifique } from "./core/useCase/MettreAJourActivationProgrammationSpecifique";
import { BasculerArchivageListeDiffusion } from "./core/useCase/BasculerArchivageListeDiffusion";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { NotificationProducer } from "@notification/infra/Notification.producer";
import { NotificationModule } from "@notification/Notification.module";

@Module({
    imports: [ConfigModule, TaskModule, DatabaseModule, AnalyticsModule, AdminModule, NotificationModule],
    controllers: [PlanMarketingController, CampagneController, ListeDiffusionController],
    providers: [
        Logger,
        ImporterEtCreerListeDiffusion,
        AssocierListeDiffusionToCampagne,
        PlanMarketingActionSelectorService,
        planMarketingFactory,
        CampagneService,
        ListeDiffusionService,
        CreerListeDiffusion,
        ImporterContacts,
        {
            provide: TaskGateway,
            useClass: TaskRepository,
        },
        {
            provide: FileGateway,
            useClass: FileProvider,
        },
        {
            provide: CampagneGateway,
            useClass: CampagneMongoRepository,
        },
        {
            provide: ListeDiffusionGateway,
            useClass: ListeDiffusionMongoRepository,
        },
        ...taskMongoProviders,
        ...campagneMongoProviders,
        ...listeDiffusionMongoProviders,
        MettreAJourCampagne,
        {
            provide: SearchYoungGateway,
            useClass: SearchYoungElasticRepository,
        },
        { provide: NotificationGateway, useClass: NotificationProducer },
        PreparerEnvoiCampagne,
        EnvoyerCampagne,
        CampagneContactBuilderService,
        CampagneProcessorService,
        CampagneDataFetcherService,
        ProgrammationService,
        EnvoyerCampagneProgrammee,
        BasculerArchivageCampagne,
        MettreAJourActivationProgrammationSpecifique,
        BasculerArchivageListeDiffusion,
    ],
    exports: [
        EnvoyerCampagneProgrammee,
        PreparerEnvoiCampagne,
        BasculerArchivageCampagne,
        CreerListeDiffusion,
        ImporterContacts,
        {
            provide: CampagneGateway,
            useClass: CampagneMongoRepository,
        },
        {
            provide: ListeDiffusionGateway,
            useClass: ListeDiffusionMongoRepository,
        },
        planMarketingFactory,
        BasculerArchivageListeDiffusion,
    ],
})
export class PlanMarketingModule {}
