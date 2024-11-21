import { Module } from "@nestjs/common";
import { NotificationJobModule } from "@notification/NotificationJob.module";
import { AdminJobModule } from "./admin/AdminJob.module";
import configuration from "@config/configuration";
import { ConfigModule } from "@nestjs/config";
import { QueueModule } from "@infra/Queue.module";

@Module({
    imports: [QueueModule, NotificationJobModule, AdminJobModule],
})
export class MainJobModule {}
