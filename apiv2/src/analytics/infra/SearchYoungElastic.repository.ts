import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchParams, YoungType } from "snu-lib";
import { SearchYoungGateway, SearchYoungResult } from "../core/SearchYoung.gateway";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";

@Injectable()
export class SearchYoungElasticRepository implements SearchYoungGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchYoung(params: SearchParams): Promise<SearchYoungResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchYoungResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<YoungType>("young")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setRanges(params.ranges)
            .setSearchTerm(params.searchTerm)
            .setSort(params.sortField, params.sortOrder);
        const response = await this.elasticsearchService.search<ESSearchResponse<YoungType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<YoungType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchYoungResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "young", keep_alive: "1m" });
        let youngs: YoungType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<YoungType>("young")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setRanges(params.ranges)
                .setSearchTerm(params.searchTerm)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<YoungType>>(queryBuilder.build());
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            youngs = youngs.concat(hits.map((hit) => ElasticMapper.mapElasticHitToResult<YoungType>(hit)));
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: youngs,
            total: youngs.length,
        };
    }

    async countYoung(params: Pick<SearchParams, "filters" | "searchTerm" | "existingFields">): Promise<number> {
        const queryBuilder = new ElasticsearchQueryBuilder<YoungType>("young")
            .setFilters(params.filters)
            .setExistingFields(params.existingFields)
            .setSearchTerm(params.searchTerm);
        const response = await this.elasticsearchService.count(queryBuilder.buildCountQuery());
        return response.body.count;
    }
}
