export interface ESSearchQuery<T> {
    index: string;
    body: {
        from?: number;
        size?: number;
        query: ESQuery;
        sort?: Array<{ [key in NestedKeys<T>]?: { order: "asc" | "desc" } }>;
        _source?: string[] | boolean;
    };
}

export type NestedKeys<T> = {
    [K in keyof T]: T[K] extends object ? `${string & K}.${string & keyof T[K]}` | (string & K) : string & K;
}[keyof T];

export interface ESQuery {
    bool: {
        must: Array<ESMustQuery>;
        filter?: Array<ESFilterQuery>;
    };
}

export interface ESMustQuery {
    multi_match?: {
        query: string;
        fields: string[];
    };
    match_all?: Record<string, never>;
    terms?: Record<string, string[]>;
}

export interface ESFilterQuery {
    terms: Record<string, string[]>;
}

export interface SearchParams {
    searchTerm?: string;
    filters?: Record<string, string | string[]>;
    sourceFields?: string[];
    page?: number;
    size?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
}

export interface ESSearchResponse<T> {
    hits: {
        hits: Array<{
            _source: T;
            _id: string;
            _index: string;
            _score: number;
            _type: string;
        }>;
        sort: string[];
        total: {
            value: number;
            relation: "eq" | "gte";
        };
    };
}
