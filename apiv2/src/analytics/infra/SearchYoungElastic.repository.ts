import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchParams, YoungType } from "snu-lib";
import { SearchYoungGateway, SearchYoungResult } from "../core/SearchYoung.gateway";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse, NestedKeys } from "./ElasticQuery";

@Injectable()
export class SearchYoungElasticRepository implements SearchYoungGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchYoung(params: SearchParams): Promise<SearchYoungResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<YoungType>("young")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setFilters(params.filters)
            .setSearchTerm(params.searchTerm)
            .setSort(params.sortField as NestedKeys<YoungType>, params.sortOrder ?? "asc");

        const response = await this.elasticsearchService.search<ESSearchResponse<YoungType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => hit._source),
            total: response.body.hits.total.value,
        };
    }
}
