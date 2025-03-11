import { Body, Controller, Get, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import {
    TaskName,
    TaskStatus,
    DesistementRoutes,
    DesisterSimulationTaskParameters,
    DesisterValiderTaskParameters,
} from "snu-lib";
import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { DesistementService } from "@admin/core/sejours/phase1/desistement/Desistement.service";
import { Phase1Service, StatusSimulation, StatusValidation } from "@admin/core/sejours/phase1/Phase1.service";

@Controller("desistement")
export class DesistementController {
    constructor(
        @Inject(DesistementService) private readonly desistementService: DesistementService,
        @Inject(Phase1Service) private readonly phase1Service: Phase1Service,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId")
    async getStatus(
        @Param("sessionId") sessionId: string,
        @Param("type") type: string,
    ): Promise<DesistementRoutes["GetDesistement"]["response"]> {
        let simulation: StatusSimulation;
        let traitement: StatusValidation;

        simulation = await this.phase1Service.getStatusSimulation(
            sessionId,
            TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION,
        );
        traitement = await this.phase1Service.getStatusValidation(
            sessionId,
            TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER,
        );

        return {
            simulation,
            traitement: {
                ...traitement,
                lastCompletedAt: traitement.lastCompletedAt?.toISOString(),
            },
        };
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation")
    async simulationDesister(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: { affectationTaskId: string },
    ): Promise<DesistementRoutes["PostSimuler"]["response"]> {
        const parameters: DesisterSimulationTaskParameters = {
            sessionId,
            affectationTaskId: payload.affectationTaskId,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/valider")
    async validerionDesister(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: { affectationTaskId: string },
    ): Promise<DesistementRoutes["PostSimuler"]["response"]> {
        const parameters: DesisterValiderTaskParameters = {
            sessionId,
            affectationTaskId: payload.affectationTaskId,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }
}
