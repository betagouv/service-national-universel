import { EtablissementType, SearchParams, SearchResult } from "snu-lib";

export type SearchEtablissementResult = SearchResult<EtablissementType>;

export interface SearchEtablissementGateway {
    searchEtablissement(query: SearchParams): Promise<SearchEtablissementResult>;
}

export const SearchEtablissementGateway = Symbol("SearchEtablissementGateway");
