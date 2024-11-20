import { Module } from "@nestjs/common";
import { TaskRepository } from "./infra/TaskMongo.repository";
import { taskMongoProviders } from "./infra/TaskMongo.provider";
import { DatabaseModule } from "@infra/Database.module";

@Module({
    imports: [DatabaseModule],
    providers: [TaskRepository, ...taskMongoProviders],
    exports: [TaskRepository],
})
export class TaskModule {}
