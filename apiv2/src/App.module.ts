import { Global, Logger, MiddlewareConsumer, Module } from "@nestjs/common";
import configuration from "./config/configuration";
import { ConfigModule } from "@nestjs/config";
import { SentryModule } from "@sentry/nestjs/setup";

import { AdminModule } from "./admin/Admin.module";
import { LoggerRequestMiddleware } from "./shared/infra/LoggerRequest.middleware";
import { CorrelationIdMiddleware } from "./shared/infra/CorrelationId.middleware.js";
import { SharedModule } from "./shared/Shared.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        SentryModule.forRoot(),
        AdminModule,
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
