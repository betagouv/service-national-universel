import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { ApplicationType, SearchParams } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import { SearchApplicationGateway, SearchApplicationResult } from "@analytics/core/SearchApplication.gateway";

@Injectable()
export class SearchApplicationElasticRepository implements SearchApplicationGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchApplication(params: SearchParams): Promise<SearchApplicationResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchApplicationResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<ApplicationType>("application")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setRanges(params.ranges)
            .setSearchTerm(params.searchTerm)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<ApplicationType>>(
            queryBuilder.build(),
        );
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<ApplicationType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchApplicationResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "application", keep_alive: "1m" });
        let applications: ApplicationType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 50;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<ApplicationType>("application")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setRanges(params.ranges)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<ApplicationType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            applications = applications.concat(
                hits.map((hit) => ElasticMapper.mapElasticHitToResult<ApplicationType>(hit)),
            );
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: applications,
            total: applications.length,
        };
    }
}
