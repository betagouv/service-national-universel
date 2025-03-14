import { ESSearchQuery, SearchParams, NestedKeys } from "./QueryBuilder.types";

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
        const sortObject = { [`${field}.keyword`]: { order } } as { [key in NestedKeys<T>]: { order: "asc" | "desc" } };
        this.query.body.sort = [sortObject];
        return this;
    }

    setSearchTerm(searchTerm: string, fields: string[]): this {
        if (searchTerm) {
            this.query.body.query.bool.must.push({
                multi_match: {
                    query: searchTerm,
                    fields,
                },
            });
        } else {
            this.query.body.query.bool.must.push({ match_all: {} });
        }
        return this;
    }

    setFilters(filters: Record<string, string | string[]>): this {
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

    build(): ESSearchQuery<T> {
        return this.query;
    }
}
