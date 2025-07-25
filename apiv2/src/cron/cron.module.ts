import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { QueueName } from "@shared/infra/Queue";
import { CronJobSchedulerService } from "./infra/CronJobScheduler.service";
import { CronJobConsumer } from "./infra/CronJob.consumer";
import { CronJobSelectorService } from "./infra/CronJobSelector.service";
import { PlanMarketingModule } from "@plan-marketing/plan-marketing.module";
import { AdminJobModule } from "@admin/AdminJob.module";

@Module({
    imports: [
        PlanMarketingModule,
        AdminJobModule,
        BullModule.registerQueue({
            name: QueueName.CRON,
        }),
    ],
    providers: [CronJobSchedulerService, CronJobConsumer, CronJobSelectorService],
})
export class CronModule {}
