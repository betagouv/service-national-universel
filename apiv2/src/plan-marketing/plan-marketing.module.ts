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

@Module({
    imports: [ConfigModule, TaskModule, DatabaseModule],
    controllers: [PlanMarketingController],
    providers: [
        Logger,
        ImporterEtCreerListeDiffusion,
        AssocierListeDiffusionToCampagne,
        PlanMarketingActionSelectorService,
        planMarketingFactory,
        {
            provide: TaskGateway,
            useClass: TaskRepository,
        },
        ...taskMongoProviders,
    ],
})
export class PlanMarketingModule {}
