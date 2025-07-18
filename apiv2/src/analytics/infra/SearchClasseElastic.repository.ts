import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchParams, ClasseType } from "snu-lib";
import { ElasticsearchQueryBuilder } from "./ElasticQuery.builder";
import { ESSearchResponse } from "./ElasticQuery";
import { ElasticMapper } from "./Elastic.mapper";
import { SearchClasseGateway, SearchClasseResult } from "@analytics/core/SearchClasse.gateway";

@Injectable()
export class SearchClasseElasticRepository implements SearchClasseGateway {
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async searchClasse(params: SearchParams): Promise<SearchClasseResult> {
        if (!params.full) {
            return this.searchWithPagination(params);
        }
        return this.searchAll(params);
    }

    private async searchWithPagination(params: SearchParams): Promise<SearchClasseResult> {
        const queryBuilder = new ElasticsearchQueryBuilder<ClasseType>("classe")
            .setPagination(params.page, params.size)
            .setSourceFields(params.sourceFields)
            .setSearchTerm(params.searchTerm)
            .setRanges(params.ranges)
            .setFilters(params.filters)
            .setMusts(params.musts)
            .setSort(params.sortField, params.sortOrder);

        const response = await this.elasticsearchService.search<ESSearchResponse<ClasseType>>(queryBuilder.build());
        return {
            hits: response.body.hits.hits.map((hit) => ElasticMapper.mapElasticHitToResult<ClasseType>(hit)),
            total: response.body.hits.total.value,
        };
    }

    private async searchAll(params: SearchParams): Promise<SearchClasseResult> {
        const pit = await this.elasticsearchService.openPointInTime({ index: "classe", keep_alive: "1m" });
        let classes: ClasseType[] = [];
        let searchAfter: any[] | undefined;
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;
            const queryBuilder = new ElasticsearchQueryBuilder<ClasseType>("classe")
                .setPagination(undefined, 10000)
                .setSourceFields(params.sourceFields)
                .setSearchTerm(params.searchTerm)
                .setRanges(params.ranges)
                .setFilters(params.filters)
                .setMusts(params.musts)
                .setSort(params.sortField, params.sortOrder, "_id")
                .setPit(pit.body.id)
                .setSearchAfter(searchAfter);

            const response = await this.elasticsearchService.search<ESSearchResponse<ClasseType>>(queryBuilder.build());
            const hits = response.body.hits.hits;

            if (hits.length === 0) {
                break;
            }

            classes = classes.concat(hits.map((hit) => ElasticMapper.mapElasticHitToResult<ClasseType>(hit)));
            searchAfter = hits[hits.length - 1].sort;
        }

        await this.elasticsearchService.closePointInTime({ body: { id: pit.body.id } });

        return {
            hits: classes,
            total: classes.length,
        };
    }
}
