import { HistoryType } from "@admin/core/history/History";
import { HistoryGateway } from "@admin/core/history/History.gateway";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { Controller, Get, Inject, ParseEnumPipe, Query, UseGuards } from "@nestjs/common";
import { PatchType } from "snu-lib";

@Controller("history")
export class HistoryController {
    constructor(@Inject(HistoryGateway) private readonly historyGateway: HistoryGateway) {}

    @UseGuards(SuperAdminGuard)
    @Get("/reference")
    async getHistory(
        @Query("collection", new ParseEnumPipe(HistoryType)) ref: HistoryType,
        @Query("id") id: string,
    ): Promise<Array<PatchType>> {
        const history = await this.historyGateway.findByReferenceId(ref, id);
        return history;
    }
}
