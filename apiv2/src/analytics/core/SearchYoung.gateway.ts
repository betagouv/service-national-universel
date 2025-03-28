import { SearchParams, SearchResult, YoungType } from "snu-lib";

export type SearchYoungResult = SearchResult<YoungType>;

export interface SearchYoungGateway {
    searchYoung(query: SearchParams): Promise<SearchYoungResult>;
    countYoung(query: Pick<SearchParams, "filters" | "existingFields" | "searchTerm">): Promise<number>;
}

export const SearchYoungGateway = Symbol("SearchYoungGateway");
