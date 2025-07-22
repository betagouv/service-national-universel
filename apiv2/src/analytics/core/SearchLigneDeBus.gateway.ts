import { LigneBusType, SearchParams, SearchResult } from "snu-lib";

export type SearchLigneDeBusResult = SearchResult<LigneBusType>;

export interface SearchLigneDeBusGateway {
    searchLigneDeBus(query: SearchParams): Promise<SearchLigneDeBusResult>;
}

export const SearchLigneDeBusGateway = Symbol("SearchLigneDeBusGateway");
