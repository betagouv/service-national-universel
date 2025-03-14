import { Body, Controller, Get, Inject, Post, Query } from "@nestjs/common";
import { SearchYoungGateway, SearchYoungResult } from "src/analytics/core/SearchYoung.gateway";
import { SearchYoungDto } from "./dto/SearchYoung.dto";

@Controller("/search-young")
export class SearchYoungController {
    constructor(@Inject(SearchYoungGateway) private readonly searchYoungGateway: SearchYoungGateway) {}

    @Post()
    async searchYoung(@Body() query: SearchYoungDto): Promise<SearchYoungResult> {
        return this.searchYoungGateway.searchYoungForListeDiffusion(query);
    }
}
