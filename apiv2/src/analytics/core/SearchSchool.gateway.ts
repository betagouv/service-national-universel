import { SchoolType, SearchParams, SearchResult } from "snu-lib";

export type SearchSchoolResult = SearchResult<SchoolType>;

export interface SearchSchoolGateway {
    searchSchool(query: SearchParams): Promise<SearchSchoolResult>;
}

export const SearchSchoolGateway = Symbol("SearchSchoolGateway");
