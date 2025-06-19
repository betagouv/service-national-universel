import { ApplicationType, SearchParams, SearchResult } from "snu-lib";

export type SearchApplicationResult = SearchResult<ApplicationType>;

export interface SearchApplicationGateway {
    searchApplication(query: SearchParams): Promise<SearchApplicationResult>;
}

export const SearchApplicationGateway = Symbol("SearchApplicationGateway");
