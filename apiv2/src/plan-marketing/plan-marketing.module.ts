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

@Module({
    imports: [ConfigModule, TaskModule, DatabaseModule],
    controllers: [PlanMarketingController, CampagneController],
    providers: [
        Logger,
        ImporterEtCreerListeDiffusion,
        AssocierListeDiffusionToCampagne,
        PlanMarketingActionSelectorService,
        planMarketingFactory,
        CampagneService,
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
        ...taskMongoProviders,
        ...campagneMongoProviders,
    ],
})
export class PlanMarketingModule {}
