import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchParams, SessionPhase1Type } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import { SearchSejourGateway, SearchSejourResult } from "@analytics/core/SearchSejour.gateway";

@Injectable()
export class SearchSejourElasticRepository implements SearchSejourGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchSejour(params: SearchParams): Promise<SearchSejourResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchSejourResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<SessionPhase1Type>("sessionphase1")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<SessionPhase1Type>>(
            queryBuilder.build(),
        );
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<SessionPhase1Type>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchSejourResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "sessionphase1", keep_alive: "1m" });
        let sessionsPhase1: SessionPhase1Type[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<SessionPhase1Type>("sessionphase1")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<SessionPhase1Type>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            sessionsPhase1 = sessionsPhase1.concat(
                hits.map((hit) => ElasticMapper.mapElasticHitToResult<SessionPhase1Type>(hit)),
            );
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: sessionsPhase1,
            total: sessionsPhase1.length,
        };
    }
}
