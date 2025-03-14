import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { SearchYoungGateway } from "./core/SearchYoung.gateway";
import { SearchYoungElasticRepository } from "./infra/SearchYoungElastic.repository";
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
            useClass: SearchYoungElasticRepository,
        },
    ],
    controllers: [SearchYoungController],
})
export class AnalyticsModule {}
