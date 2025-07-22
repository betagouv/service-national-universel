import { LigneToPointType, SearchParams, SearchResult } from "snu-lib";

export type SearchSegmentDeLigneResult = SearchResult<LigneToPointType>;

export interface SearchSegmentDeLigneGateway {
    searchSegmentDeLigne(query: SearchParams): Promise<SearchSegmentDeLigneResult>;
}

export const SearchSegmentDeLigneGateway = Symbol("SearchSegmentDeLigneGateway");
