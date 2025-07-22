import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchParams, PointDeRassemblementType } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import {
    SearchPointDeRassemblementGateway,
    SearchPointDeRassemblementResult,
} from "@analytics/core/SearchPointDeRassemblement.gateway";

@Injectable()
export class SearchPointDeRassemblementElasticRepository implements SearchPointDeRassemblementGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchPointDeRassemblement(params: SearchParams): Promise<SearchPointDeRassemblementResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchPointDeRassemblementResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<PointDeRassemblementType>("pointderassemblement")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<PointDeRassemblementType>>(
            queryBuilder.build(),
        );
        return {
            hits: response.body.hits.hits.map((hit) =>
                ElasticMapper.mapElasticHitToResult<PointDeRassemblementType>(hit),
            ),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchPointDeRassemblementResult> {
        const pit = await this.elasticsearchService.openPointInTime({
            index: "pointderassemblement",
            keep_alive: "1m",
        });
        let pointDeRassemblements: PointDeRassemblementType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<PointDeRassemblementType>("pointderassemblement")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<PointDeRassemblementType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            pointDeRassemblements = pointDeRassemblements.concat(
                hits.map((hit) => ElasticMapper.mapElasticHitToResult<PointDeRassemblementType>(hit)),
            );
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: pointDeRassemblements,
            total: pointDeRassemblements.length,
        };
    }
}
