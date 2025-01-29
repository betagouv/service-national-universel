import { Controller, Delete, Get, Inject, Param, ParseArrayPipe, Query, UseGuards } from "@nestjs/common";

import { Phase1Routes, TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { SupprimerPlanDeTransport } from "@admin/core/sejours/phase1/affectation/SupprimerPlanDeTransport";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";

const PHASE1_SIMULATIONS_TASK_NAMES = [TaskName.AFFECTATION_HTS_SIMULATION, TaskName.AFFECTATION_CLE_SIMULATION];
const PHASE1_TRAITEMENTS_TASK_NAMES = [
    TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
    TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
];

@Controller("phase1")
export class Phase1Controller {
    constructor(
        private readonly supprimerPlanDeTransport: SupprimerPlanDeTransport,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId/simulations")
    async getSimulations(
        @Param("sessionId")
        sessionId: string,
        @Query("name")
        name?: TaskName,
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
        const simulations = await this.taskGateway.findByNames(
            name ? [name] : PHASE1_SIMULATIONS_TASK_NAMES,
            filter,
            sort,
        );
        return simulations.map(TaskMapper.toDto);
    }

    @UseGuards(AdminGuard)
    @Get("/:sessionId/traitements")
    async getTraitements(
        @Param("sessionId")
        sessionId: string,
        @Query("name")
        name?: TaskName,
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
        const simulations = await this.taskGateway.findByNames(
            name ? [name] : PHASE1_TRAITEMENTS_TASK_NAMES,
            filter,
            sort,
        );
        return simulations.map(TaskMapper.toDto);
    }

    @UseGuards(SuperAdminGuard)
    @Delete("/:sessionId/plan-de-transport")
    async deletePlanDeTransport(
        @Param("sessionId")
        sessionId: string,
    ): Promise<Phase1Routes["DeletePDT"]["response"]> {
        return await this.supprimerPlanDeTransport.execute(sessionId);
    }
}
