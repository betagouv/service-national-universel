import { SessionPhase1Type, SearchParams, SearchResult } from "snu-lib";

export type SearchSejourResult = SearchResult<SessionPhase1Type>;

export interface SearchSejourGateway {
    searchSejour(query: SearchParams): Promise<SearchSejourResult>;
}

export const SearchSejourGateway = Symbol("SearchSejourGateway");
