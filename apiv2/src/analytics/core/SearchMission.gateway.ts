import { MissionType, SearchParams, SearchResult } from "snu-lib";

export type SearchMissionResult = SearchResult<MissionType>;

export interface SearchMissionGateway {
    searchMission(query: SearchParams): Promise<SearchMissionResult>;
}

export const SearchMissionGateway = Symbol("SearchMissionGateway");
