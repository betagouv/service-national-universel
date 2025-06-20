import { ReferentType, SearchParams, SearchResult } from "snu-lib";

export type SearchReferentResult = SearchResult<ReferentType>;

export interface SearchReferentGateway {
    searchReferent(query: SearchParams): Promise<SearchReferentResult>;
}

export const SearchReferentGateway = Symbol("SearchReferentGateway");
