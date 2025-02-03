import { Module } from "@nestjs/common";
import { CreerListeDiffusionController } from "./infra/api/ListeDiffusion.controller";
import { ImporterContacts } from "./core/useCase/ImporterContacts";
import { planMarketingFactory } from "./infra/provider/PlanMarketing.factory";
import { ConfigModule } from "@nestjs/config";
import { TaskModule } from "@task/Task.module";

@Module({
    imports: [ConfigModule, TaskModule],
    controllers: [CreerListeDiffusionController],
    providers: [ImporterContacts, planMarketingFactory],
})
export class PlanMarketingModule {}
