import { Controller, Delete, Get, Inject, Param, Query, UseGuards } from "@nestjs/common";

import { Phase1Routes, TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { SupprimerPlanDeTransport } from "@admin/core/sejours/phase1/affectation/SupprimerPlanDeTransport";
import { SupprimerLigneDeBus } from "@admin/core/sejours/phase1/affectation/SupprimerLigneDeBus";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { SimulationAffectationHTSTaskModel } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSTask.model";
import { DeleteLigneDeBusParamsDto } from "./Phase1.validation";

const PHASE1_SIMULATIONS_TASK_NAMES = [
    TaskName.AFFECTATION_HTS_SIMULATION,
    TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION,
    TaskName.AFFECTATION_CLE_SIMULATION,
    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION,
    TaskName.BACULE_JEUNES_VALIDES_SIMULATION,
    TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION,
    TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION,
];
const PHASE1_TRAITEMENTS_TASK_NAMES = [
    TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
    TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION_VALIDER,
    TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER,
    TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER,
    TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER,
    TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER,
];

@Controller("phase1")
export class Phase1Controller {
    constructor(
        private readonly supprimerPlanDeTransport: SupprimerPlanDeTransport,
        private readonly supprimerLigneDeBus: SupprimerLigneDeBus,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

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

    @UseGuards(SuperAdminGuard)
    @Delete("/:sessionId/ligne-de-bus/:ligneId")
    async deleteLigneDeBus(
        @Param()
        { sessionId, ligneId }: DeleteLigneDeBusParamsDto,
    ): Promise<Phase1Routes["DeleteLigneBus"]["response"]> {
        await this.supprimerLigneDeBus.execute(sessionId, ligneId);
    }
}
