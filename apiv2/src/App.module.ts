import { Logger, MiddlewareConsumer, Module, ParseEnumPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SentryModule } from "@sentry/nestjs/setup";
import configuration from "./config/configuration";

import { QueueModule } from "@infra/Queue.module";
import { AdminModule } from "./admin/Admin.module";
import { CorrelationIdMiddleware } from "./shared/infra/CorrelationId.middleware.js";
import { LoggerRequestMiddleware } from "./shared/infra/LoggerRequest.middleware";
import { HealthCheckController } from "@infra/HealthCheck.controller";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        SentryModule.forRoot(),
        AdminModule,
        QueueModule,
    ],
    controllers: [HealthCheckController],
    providers: [Logger],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerRequestMiddleware).forRoutes("*");
        consumer.apply(CorrelationIdMiddleware).forRoutes("*");
    }
}
