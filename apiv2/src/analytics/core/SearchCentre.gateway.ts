import { CohesionCenterType, SearchParams, SearchResult } from "snu-lib";

export type SearchCentreResult = SearchResult<CohesionCenterType>;

export interface SearchCentreGateway {
    searchCentre(query: SearchParams): Promise<SearchCentreResult>;
}

export const SearchCentreGateway = Symbol("SearchCentreGateway");
