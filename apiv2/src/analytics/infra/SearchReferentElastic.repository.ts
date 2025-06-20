import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { ReferentType, SearchParams } from "snu-lib";
import { SearchReferentGateway, SearchReferentResult } from "../core/SearchReferent.gateway";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";

@Injectable()
export class SearchReferentElasticRepository implements SearchReferentGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchReferent(params: SearchParams): Promise<SearchReferentResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchReferentResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<ReferentType>("referent")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setRanges(params.ranges)
            .setSearchTerm(params.searchTerm)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<ReferentType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<ReferentType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchReferentResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "referent", keep_alive: "1m" });
        let referents: ReferentType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<ReferentType>("referent")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<ReferentType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            referents = referents.concat(hits.map((hit) => ElasticMapper.mapElasticHitToResult<ReferentType>(hit)));
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: referents,
            total: referents.length,
        };
    }
}
