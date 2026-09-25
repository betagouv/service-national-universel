import { Controller, Get, Inject, Param, Query, UseGuards } from "@nestjs/common";

import { Phase1Routes, TaskName } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { SimulationAffectationHTSTaskModel } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSTask.model";
import { StrictQueryPipe } from "@shared/infra/StrictQuery.pipe";
import {
    GetSimulationsQueryDto,
    GetTraitementsQueryDto,
    PHASE1_SIMULATIONS_TASK_NAMES,
    PHASE1_TRAITEMENTS_TASK_NAMES,
} from "./Phase1.validation";

// DELETE /:sessionId/plan-de-transport et DELETE /:sessionId/ligne-de-bus/:ligneId sont supprimées :
// plus aucune écriture phase 1 depuis apiv2.
@Controller("phase1")
export class Phase1Controller {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    @UseGuards(AdminGuard)
    @Get("/simulations/:id")
    async getSimulation(
        @Param("id")
        id: string,
    ): Promise<Phase1Routes["GetSimulationRoute"]["response"]> {
        const simulation = await this.taskGateway.findById(id);
        return TaskMapper.toDto(simulation);
    }

    @UseGuards(AdminGuard)
    @Get("/:sessionId/simulations")
    async getSimulations(
        @Param("sessionId")
        sessionId: string,
        @Query(StrictQueryPipe) { name, status, sort }: GetSimulationsQueryDto,
    ): Promise<Phase1Routes["GetSimulationsRoute"]["response"]> {
        const filter: { [key: string]: string } = {
            "metadata.parameters.sessionId": sessionId,
        };
        if (status) {
            filter.status = status;
        }
        const simulations = await this.taskGateway.findByNames(
            name ? [name] : PHASE1_SIMULATIONS_TASK_NAMES,
            filter,
            sort || undefined,
        );

        return simulations.map((simulation) => {
            if (simulation.name === TaskName.AFFECTATION_HTS_SIMULATION) {
                const simulationHts = simulation as SimulationAffectationHTSTaskModel;
                return TaskMapper.toDto({
                    ...simulationHts,
                    metadata: {
                        ...simulationHts.metadata,
                        results: {
                            ...simulationHts.metadata?.results,
                            iterationCostList: undefined, // array of 300 elements, too long to display in search result
                        },
                    },
                });
            }
            return TaskMapper.toDto(simulation);
        });
    }

    @UseGuards(AdminGuard)
    @Get("/:sessionId/traitements")
    async getTraitements(
        @Param("sessionId")
        sessionId: string,
        @Query(StrictQueryPipe) { name, status, sort }: GetTraitementsQueryDto,
    ): Promise<Phase1Routes["GetSimulationsRoute"]["response"]> {
        const filter: { [key: string]: string } = {
            "metadata.parameters.sessionId": sessionId,
        };
        if (status) {
            filter.status = status;
        }
        const simulations = await this.taskGateway.findByNames(
            name ? [name] : PHASE1_TRAITEMENTS_TASK_NAMES,
            filter,
            sort || undefined,
        );
        return simulations.map(TaskMapper.toDto);
    }
}
