import { ClasseType, SearchParams, SearchResult } from "snu-lib";

export type SearchClasseResult = SearchResult<ClasseType>;

export interface SearchClasseGateway {
    searchClasse(query: SearchParams): Promise<SearchClasseResult>;
}

export const SearchClasseGateway = Symbol("SearchClasseGateway");
