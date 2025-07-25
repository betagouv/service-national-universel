import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { StructureType, SearchParams } from "snu-lib";
import { SearchStructureGateway, SearchStructureResult } from "../core/SearchStructure.gateway";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";

@Injectable()
export class SearchStructureElasticRepository implements SearchStructureGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchStructure(params: SearchParams): Promise<SearchStructureResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchStructureResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<StructureType>("structure")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<StructureType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<StructureType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchStructureResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "structure", keep_alive: "1m" });
        let structures: StructureType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<StructureType>("structure")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<StructureType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            structures = structures.concat(hits.map((hit) => ElasticMapper.mapElasticHitToResult<StructureType>(hit)));
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: structures,
            total: structures.length,
        };
    }
}
