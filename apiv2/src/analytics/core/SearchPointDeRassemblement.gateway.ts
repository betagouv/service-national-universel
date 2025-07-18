import { PointDeRassemblementType, SearchParams, SearchResult } from "snu-lib";

export type SearchPointDeRassemblementResult = SearchResult<PointDeRassemblementType>;

export interface SearchPointDeRassemblementGateway {
    searchPointDeRassemblement(query: SearchParams): Promise<SearchPointDeRassemblementResult>;
}

export const SearchPointDeRassemblementGateway = Symbol("SearchPointDeRassemblementGateway");
