import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { SearchYoungGateway, SearchYoungResult } from "src/analytics/core/SearchYoung.gateway";
import { SearchYoungDto } from "./dto/SearchYoung.validation";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { AnalyticsRoutes } from "snu-lib";

@Controller("/youngs")
@UseGuards(SuperAdminGuard, AdminGuard)
export class SearchYoungController {
    constructor(@Inject(SearchYoungGateway) private readonly searchYoungGateway: SearchYoungGateway) {}

    @Post()
    async searchYoung(@Body() query: SearchYoungDto): Promise<SearchYoungResult> {
        return this.searchYoungGateway.searchYoung(query);
    }

    @Post("/count")
    async countYoung(
        @Body() query: Pick<SearchYoungDto, "filters" | "searchTerm">,
    ): Promise<AnalyticsRoutes["GetYoungCount"]["response"]> {
        const count = await this.searchYoungGateway.countYoung(query);
        return {
            count,
        };
    }
}
