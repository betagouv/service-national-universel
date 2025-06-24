import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { SearchYoungGateway } from "./core/SearchYoung.gateway";
import { SearchYoungElasticRepository } from "./infra/SearchYoungElastic.repository";
import { SearchYoungController } from "./infra/api/SearchYoung.controller";
import { SearchMissionElasticRepository } from "./infra/SearchMissionElastic.repository";
import { SearchMissionGateway } from "./core/SearchMission.gateway";
import { SearchApplicationGateway } from "./core/SearchApplication.gateway";
import { SearchApplicationElasticRepository } from "./infra/SearchApplicationElastic.repository";

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
        {
            provide: SearchMissionGateway,
            useClass: SearchMissionElasticRepository,
        },
        {
            provide: SearchApplicationGateway,
            useClass: SearchApplicationElasticRepository,
        },
    ],
    controllers: [SearchYoungController],
    exports: [ElasticsearchModule],
})
export class AnalyticsModule {}
