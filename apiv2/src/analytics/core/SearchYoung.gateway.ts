import { SearchParams, SearchResult, YoungType } from "snu-lib";

export type SearchYoungResult = SearchResult<YoungType>;

export interface SearchYoungGateway {
    searchYoung(query: SearchParams): Promise<SearchYoungResult>;
}

export const SearchYoungGateway = Symbol("SearchYoungGateway");
