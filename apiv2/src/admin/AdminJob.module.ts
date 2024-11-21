import configuration from "@config/configuration";
import { DatabaseModule } from "@infra/Database.module";
import { QueueModule } from "@infra/Queue.module";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TaskModule } from "@task/Task.module";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { AdminTaskConsumer } from "./infra/task/AdminTask.consumer";
import { AdminTaskRepository } from "./infra/task/AdminTaskMongo.repository";

@Module({
    imports: [TaskModule, DatabaseModule],
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
