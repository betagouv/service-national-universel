import { SearchTerm } from "snu-lib";
import { ESSearchQuery } from "./ElasticQuery";

export class ElasticsearchQueryBuilder<T> {
    private query: ESSearchQuery<T>;

    constructor(index: string) {
        this.query = {
            index,
            body: {
                query: {
                    bool: {
                        must: [],
                    },
                },
            },
        };
    }

    setPagination(page: number = 0, size: number = 10): this {
        this.query.body.from = page * size;
        this.query.body.size = size;
        return this;
    }

    setSort(field?: string, order: "asc" | "desc" = "asc", tiebreaker?: string): this {
        if (tiebreaker) {
            this.query.body.sort = [{ [`${tiebreaker}`]: { order } }];
        }
        if (!field) {
            return this;
        }
        const sortObject = { [`${field}.keyword`]: { order } };
        this.query.body.sort?.push(sortObject);
        return this;
    }

    setSearchTerm(searchTerm: SearchTerm | undefined): this {
        if (!searchTerm?.value) {
            return this;
        }

        const should = searchTerm.fields.flatMap((field) => [
            {
                wildcard: {
                    [`${field}.keyword`]: {
                        value: `${searchTerm.value}*`,
                    },
                },
            },
            {
                wildcard: {
                    [`${field}.keyword`]: {
                        value: `*${searchTerm.value}`,
                    },
                },
            },
        ]);

        this.query.body.query.bool.must.push({
            bool: {
                should,
                minimum_should_match: 1,
            },
        });

        return this;
    }

    setFilters(filters: Record<string, string | string[]> | undefined): this {
        if (!filters) {
            return this;
        }

        if (!this.query.body.query.bool.filter) {
            this.query.body.query.bool.filter = [];
        }

        Object.entries(filters).forEach(([key, value]) => {
            if (value?.length > 0) {
                this.query.body.query.bool.filter!.push({
                    terms: {
                        [`${key}.keyword`]: Array.isArray(value) ? value : [value],
                    },
                });
            }
        });
        return this;
    }

    setSourceFields(fields: string[] | undefined): this {
        if (!fields) {
            return this;
        }
        this.query.body._source = fields;
        return this;
    }

    setPit(pitId: string): this {
        this.query.index = undefined;
        this.query.body.pit = {
            id: pitId,
            keep_alive: "1m",
        };
        return this;
    }

    setSearchAfter(searchAfter: any[] | undefined): this {
        if (searchAfter) {
            this.query.body.search_after = searchAfter;
        }
        return this;
    }

    build(): ESSearchQuery<T> {
        return this.query;
    }

    buildCountQuery() {
        return {
            index: this.query.index,
            body: {
                query: this.query.body.query,
            },
        };
    }
}
