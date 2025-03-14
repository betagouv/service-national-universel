import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { YoungType } from "snu-lib";
import { SearchYoungGateway, SearchYoungResult } from "../core/SearchYoung.gateway";
import { ElasticsearchQueryBuilder } from "../core/elasticsearch/QueryBuilder";
import { ESSearchResponse, NestedKeys, SearchParams } from "../core/elasticsearch/QueryBuilder.types";

@Injectable()
export class SearchYoungRepository implements SearchYoungGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchYoungForListeDiffusion(params: SearchParams): Promise<SearchYoungResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<YoungType>("young").setPagination(params.page, params.size);

        if (params.filters) {
            queryBuilder.setFilters(params.filters);
        }

        if (params.sortField) {
            queryBuilder.setSort(params.sortField as NestedKeys<YoungType>, params.sortOrder ?? "asc");
        }

        const response = await this.elasticsearchService.search<ESSearchResponse<YoungType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => hit._source),
            total: response.body.hits.total.value,
        };
    }
}
