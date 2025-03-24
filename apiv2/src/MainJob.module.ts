import { Module } from "@nestjs/common";
import { NotificationJobModule } from "@notification/NotificationJob.module";
import { AdminJobModule } from "./admin/AdminJob.module";
import { HealthCheckController } from "@infra/HealthCheck.controller";
import { QueueModule } from "@infra/Queue.module";
import { ConfigModule } from "@nestjs/config";
import { SentryModule } from "@sentry/nestjs/setup";
import configuration from "./config/configuration";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        SentryModule.forRoot(),
        QueueModule,
        NotificationJobModule,
        AdminJobModule
    ],
    controllers: [HealthCheckController],
})
export class MainJobModule {}
