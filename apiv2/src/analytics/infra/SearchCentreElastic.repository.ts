import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { StructureType, SearchParams, CohesionCenterType } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import { SearchCentreGateway, SearchCentreResult } from "@analytics/core/SearchCentre.gateway";

@Injectable()
export class SearchCentreElasticRepository implements SearchCentreGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchCentre(params: SearchParams): Promise<SearchCentreResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchCentreResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<CohesionCenterType>("cohesioncenter")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<CohesionCenterType>>(
            queryBuilder.build(),
        );
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<CohesionCenterType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchCentreResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "cohesioncenter", keep_alive: "1m" });
        let centres: CohesionCenterType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<CohesionCenterType>("cohesioncenter")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<CohesionCenterType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            centres = centres.concat(hits.map((hit) => ElasticMapper.mapElasticHitToResult<CohesionCenterType>(hit)));
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: centres,
            total: centres.length,
        };
    }
}
