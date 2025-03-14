import { YoungType } from "snu-lib";
import { SearchParams } from "./elasticsearch/QueryBuilder.types";
import { SearchResult } from "./SearchResult";

export type SearchYoungResult = SearchResult<YoungType>;

export interface SearchYoungGateway {
    searchYoungForListeDiffusion(query: SearchParams): Promise<SearchYoungResult>;
}

export const SearchYoungGateway = Symbol("SearchYoungGateway");
