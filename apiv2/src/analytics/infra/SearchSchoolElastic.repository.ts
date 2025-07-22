import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { StructureType, SearchParams, SchoolType } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import { SearchSchoolGateway, SearchSchoolResult } from "@analytics/core/SearchSchool.gateway";

@Injectable()
export class SearchSchoolElasticRepository implements SearchSchoolGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchSchool(params: SearchParams): Promise<SearchSchoolResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchSchoolResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<SchoolType>("school")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<SchoolType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<SchoolType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchSchoolResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "schoolramses", keep_alive: "1m" });
        let schools: SchoolType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<SchoolType>("schoolramses")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<SchoolType>>(queryBuilder.build());
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            schools = schools.concat(hits.map((hit) => ElasticMapper.mapElasticHitToResult<SchoolType>(hit)));
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: schools,
            total: schools.length,
        };
    }
}
