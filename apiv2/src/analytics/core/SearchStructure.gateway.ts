import { StructureType, SearchParams, SearchResult } from "snu-lib";

export type SearchStructureResult = SearchResult<StructureType>;

export interface SearchStructureGateway {
    searchStructure(query: SearchParams): Promise<SearchStructureResult>;
}

export const SearchStructureGateway = Symbol("SearchStructureGateway");
