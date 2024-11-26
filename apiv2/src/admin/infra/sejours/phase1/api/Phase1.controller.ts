import { Controller, Get, Inject, Param, ParseArrayPipe, Query, UseGuards } from "@nestjs/common";

import { Phase1Routes, TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";

const PHASE1_TASK_NAMES = [TaskName.AFFECTATION_HTS_SIMULATION];

@Controller("phase1")
export class Phase1Controller {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId/simulations")
    async getSimulations(
        @Param("sessionId")
        sessionId: string,
        @Query("name")
        name?: TaskName.AFFECTATION_HTS_SIMULATION,
        @Query("status")
        status?: TaskStatus,
        @Query("sort")
        sort?: "ASC" | "DESC",
    ): Promise<Phase1Routes["GetSimulationsRoute"]["response"]> {
        const filter: any = {
            "metadata.parameters.sessionId": sessionId,
        };
        if (status) {
            filter.status = status;
        }
        const simulations = await this.taskGateway.findByName(name ? [name] : PHASE1_TASK_NAMES, filter, sort);
        return simulations.map(TaskMapper.toDto);
    }
}
