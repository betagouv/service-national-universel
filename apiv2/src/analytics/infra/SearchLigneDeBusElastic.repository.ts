import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { LigneBusType, SearchParams } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import { SearchLigneDeBusGateway, SearchLigneDeBusResult } from "@analytics/core/SearchLigneDeBus.gateway";

@Injectable()
export class SearchLigneDeBusElasticRepository implements SearchLigneDeBusGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchLigneDeBus(params: SearchParams): Promise<SearchLigneDeBusResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchLigneDeBusResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<LigneBusType>("lignebus")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<LigneBusType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<LigneBusType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchLigneDeBusResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "lignebus", keep_alive: "1m" });
        let lignesDeBus: LigneBusType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<LigneBusType>("lignebus")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<LigneBusType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            lignesDeBus = lignesDeBus.concat(hits.map((hit) => ElasticMapper.mapElasticHitToResult<LigneBusType>(hit)));
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: lignesDeBus,
            total: lignesDeBus.length,
        };
    }
}
