import { Controller, Get, Query } from "@nestjs/common";
import { PatchType } from "snu-lib";
import { HistoryRepository } from "../repository/mongo/HistoryMongo.repository";
import { HistoryType } from "../repository/mongo/historyMongo.provider";

@Controller("history")
export class HistoryController {
    constructor(private readonly patchRepository: HistoryRepository) {}
    @Get("/reference")
    async getHistory(@Query("collection") ref: HistoryType, @Query("id") id: string): Promise<Array<PatchType>> {
        const history = await this.patchRepository.findByReferenceId(ref, id);
        return history;
    }
}
