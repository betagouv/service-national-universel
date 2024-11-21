import { Logger, MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SentryModule } from "@sentry/nestjs/setup";
import configuration from "./config/configuration";

import { QueueModule } from "@infra/Queue.module";
import { AdminModule } from "./admin/Admin.module";
import { CorrelationIdMiddleware } from "./shared/infra/CorrelationId.middleware.js";
import { LoggerRequestMiddleware } from "./shared/infra/LoggerRequest.middleware";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        SentryModule.forRoot(),
        AdminModule,
        QueueModule,
    ],
    controllers: [],
    providers: [Logger],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerRequestMiddleware).forRoutes("*");
        consumer.apply(CorrelationIdMiddleware).forRoutes("*");
    }
}
