import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchParams, LigneToPointType } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import { SearchSegmentDeLigneGateway } from "@analytics/core/SearchSegmentDeLigne.gateway";
import { SearchSegmentDeLigneResult } from "@analytics/core/SearchSegmentDeLigne.gateway";

@Injectable()
export class SearchSegmentDeLigneElasticRepository implements SearchSegmentDeLigneGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchSegmentDeLigne(params: SearchParams): Promise<SearchSegmentDeLigneResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchSegmentDeLigneResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<LigneToPointType>("lignetopoint")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<LigneToPointType>>(
            queryBuilder.build(),
        );
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<LigneToPointType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchSegmentDeLigneResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "lignetopoint", keep_alive: "1m" });
        let lignesToPoints: LigneToPointType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<LigneToPointType>("lignetopoint")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<LigneToPointType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            lignesToPoints = lignesToPoints.concat(
                hits.map((hit) => ElasticMapper.mapElasticHitToResult<LigneToPointType>(hit)),
            );
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: lignesToPoints,
            total: lignesToPoints.length,
        };
    }
}
