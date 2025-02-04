import { Module } from "@nestjs/common";
import { PlanMarketingController } from "./infra/api/PlanMarketing.controller";
import { ImporterEtCreerListeDiffusion } from "./core/useCase/ImporterEtCreerListeDiffusion";
import { planMarketingFactory } from "./infra/provider/PlanMarketing.factory";
import { ConfigModule } from "@nestjs/config";
import { TaskModule } from "@task/Task.module";

@Module({
    imports: [ConfigModule, TaskModule],
    controllers: [PlanMarketingController],
    providers: [ImporterEtCreerListeDiffusion, planMarketingFactory],
})
export class PlanMarketingModule {}
