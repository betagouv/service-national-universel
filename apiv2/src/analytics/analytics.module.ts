import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { SearchYoungGateway } from "./core/SearchYoung.gateway";
import { SearchYoungRepository } from "./infra/SearchYoung.repository";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SearchYoungController } from "./infra/api/SearchYoung.controller";

@Module({
    imports: [
        ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                node: config.getOrThrow<string>("elastic.url"),
            }),
        }),
    ],
    providers: [
        {
            provide: SearchYoungGateway,
            useClass: SearchYoungRepository,
        },
    ],
    controllers: [SearchYoungController],
})
export class AnalyticsModule {}
