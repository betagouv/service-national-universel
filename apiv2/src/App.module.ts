import { Logger, MiddlewareConsumer, Module, ParseEnumPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";

import { QueueModule } from "@infra/Queue.module";
import { AdminModule } from "./admin/Admin.module";
import { CorrelationIdMiddleware } from "./shared/infra/CorrelationId.middleware.js";
import { LoggerRequestMiddleware } from "./shared/infra/LoggerRequest.middleware";
import { HealthCheckController } from "@infra/HealthCheck.controller";
import { PlanMarketingModule } from "./plan-marketing/plan-marketing.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { RouterModule } from "@nestjs/core";
import { SentryProvider as Sentry} from "@infra/shared/Sentry.provider";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
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
    providers: [Logger, Sentry],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerRequestMiddleware).forRoutes("*");
        consumer.apply(CorrelationIdMiddleware).forRoutes("*");
    }
}
