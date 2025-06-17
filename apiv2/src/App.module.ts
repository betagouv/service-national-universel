import { Logger, MiddlewareConsumer, Module, ParseEnumPipe, DynamicModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SentryModule } from "@sentry/nestjs/setup";
import configuration from "./config/configuration";

import { QueueModule } from "@infra/Queue.module";
import { AdminModule } from "./admin/Admin.module";
import { CorrelationIdMiddleware } from "./shared/infra/CorrelationId.middleware.js";
import { LoggerRequestMiddleware } from "./shared/infra/LoggerRequest.middleware";
import { HealthCheckController } from "@infra/HealthCheck.controller";
import { PlanMarketingModule } from "./plan-marketing/plan-marketing.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { RouterModule } from "@nestjs/core";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        SentryModule.forRoot(),
        AdminModule,
        QueueModule,
        PlanMarketingModule,
        AnalyticsModule,
        RouterModule.register([
            {
                path: "analytics",
                module: AnalyticsModule,
            },
        ]),
    ],
    controllers: [HealthCheckController],
    providers: [Logger],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerRequestMiddleware).forRoutes("{*all}");
        consumer.apply(CorrelationIdMiddleware).forRoutes("{*all}");
    }
}
