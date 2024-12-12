import { Controller, Get, Param, Query } from "@nestjs/common";
import { PatchRepository } from "../repository/mongo/PatchMongo.repository";
import { History, PatchDocument } from "../repository/mongo/patchMongo.provider";

@Controller("history")
export class HistoryController {
    constructor(private readonly patchRepository: PatchRepository) {}
    @Get("/reference")
    async getHistory(@Query("collection") ref: History, @Query("id") id: string): Promise<Array<PatchDocument>> {
        const history = await this.patchRepository.findByReferenceId(ref, id);
        return history;
    }
}
