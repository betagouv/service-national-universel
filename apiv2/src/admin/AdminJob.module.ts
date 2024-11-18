import { Logger, Module } from "@nestjs/common";
import { AdminTaskConsumer } from "./infra/task/AdminTask.consumer";
import { AdminTaskRepository } from "./infra/task/AdminTaskMongo.repository";
import configuration from "@config/configuration";
import { QueueModule } from "@infra/Queue.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@infra/Database.module";
import { TaskModule } from "@task/Task.module";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { BullModule } from "@nestjs/bullmq";
import { QueueType } from "@shared/infra/Queue";

@Module({
    imports: [
        TaskModule,
        DatabaseModule,
        ConfigModule.forRoot({
            load: [configuration],
        }),
        QueueModule,
        BullModule.registerQueue({
            name: QueueType.ADMIN_TASK,
        }),
    ],
    providers: [
        Logger,
        AdminTaskConsumer,
        AdminTaskRepository,
        ...taskMongoProviders,
        // add use case here
    ],
})
export class AdminJobModule {
    constructor(private logger: Logger) {
        this.logger.log("AdminJobModule has started", "AdminJobModule");
    }
}
