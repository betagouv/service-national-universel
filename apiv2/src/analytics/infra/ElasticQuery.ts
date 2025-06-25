export interface ESSearchQuery<T> {
    index?: string;
    body: {
        from?: number;
        size?: number;
        query: ESQuery;
        sort?: Array<{ [key in string]?: { order: "asc" | "desc" } }>;
        _source?: string[] | boolean;
        pit?: {
            id: string;
            keep_alive?: string;
        };
        search_after?: any[];
    };
}

export interface ESQuery {
    bool: {
        must: Array<ESMustQuery>;
        filter?: Array<ESFilterQuery>;
        should?: Array<ESMustQuery>;
    };
}

export interface ESMustQuery {
    multi_match?: {
        query: string;
        fields: string[];
        type?: "best_fields" | "most_fields" | "cross_fields" | "phrase" | "phrase_prefix";
        fuzziness?: "AUTO";
        operator?: "or" | "and";
    };
    bool?: {
        should: Array<any>;
        minimum_should_match: number;
    };
    match_all?: Record<string, never>;
    terms?: Record<string, string[]>;
    match?: Record<string, { query: string; fuzziness?: "AUTO" }>;
    exists?: { field: string };
    range?: Record<string, { gte?: Date | null; lte?: Date | null }>;
}

export type ESFilterQuery =
    | { terms: Record<string, string[]> }
    | { exists: { field: string } }
    | { bool: { must_not?: Array<{ exists: { field: string } }>, should?: any[], minimum_should_match?: number } };

export interface ESSearchResponse<T> {
    hits: {
        hits: Array<ESHit<T>>;
        sort: string[];
        total: {
            value: number;
            relation: "eq" | "gte";
        };
    };
    pit_id?: string;
}

export interface ESHit<T> {
    _source: T;
    _id: string;
    _index: string;
    _score: number;
    _type: string;
    sort?: any[];
}
