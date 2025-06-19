import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { MissionType, SearchParams } from "snu-lib";
import { SearchMissionGateway, SearchMissionResult } from "../core/SearchMission.gateway";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";

@Injectable()
export class SearchMissionElasticRepository implements SearchMissionGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchMission(params: SearchParams): Promise<SearchMissionResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchMissionResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<MissionType>("mission")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setRanges(params.ranges)
            .setSearchTerm(params.searchTerm)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<MissionType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<MissionType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchMissionResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "mission", keep_alive: "1m" });
        let missions: MissionType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<MissionType>("mission")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setRanges(params.ranges)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<MissionType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            missions = missions.concat(hits.map((hit) => ElasticMapper.mapElasticHitToResult<MissionType>(hit)));
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: missions,
            total: missions.length,
        };
    }
}
