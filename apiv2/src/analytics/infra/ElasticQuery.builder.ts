import { SearchTerm } from "snu-lib";
import { ESSearchQuery, NestedKeys } from "./ElasticQuery";

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

    setSort(field: NestedKeys<T>, order: "asc" | "desc"): this {
        if (!field) {
            return this;
        }
        const sortObject = { [`${field}.keyword`]: { order } } as { [key in NestedKeys<T>]: { order: "asc" | "desc" } };
        this.query.body.sort = [sortObject];
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

    build(): ESSearchQuery<T> {
        return this.query;
    }
}
