import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { EtablissementType, SearchParams } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import { SearchEtablissementGateway } from "@analytics/core/SearchEtablissement.gateway";
import { SearchEtablissementResult } from "@analytics/core/SearchEtablissement.gateway";

@Injectable()
export class SearchEtablissementElasticRepository implements SearchEtablissementGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchEtablissement(params: SearchParams): Promise<SearchEtablissementResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchEtablissementResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<EtablissementType>("etablissement")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<EtablissementType>>(
            queryBuilder.build(),
        );
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<EtablissementType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchEtablissementResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "etablissement", keep_alive: "1m" });
        let etablissements: EtablissementType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<EtablissementType>("etablissement")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<EtablissementType>>(
                queryBuilder.build(),
            );
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            etablissements = etablissements.concat(
                hits.map((hit) => ElasticMapper.mapElasticHitToResult<EtablissementType>(hit)),
            );
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: etablissements,
            total: etablissements.length,
        };
    }
}
