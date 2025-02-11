import { Body, Controller, Get, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";

import {
    InscriptionRoutes,
    TaskName,
    TaskStatus,
    SimulationBasculeJeunesValidesTaskParameters,
    ValiderBasculeJeunesValidesTaskParameters,
} from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";

import { PostSimulationsPayloadDto, PostSimulationValiderPayloadDto } from "./BasculeJeuneValides.validation";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { InscriptionService } from "@admin/core/sejours/phase1/inscription/Inscription.service";

@Controller("inscription")
export class BasculeJeuneValidesController {
    constructor(
        private readonly inscriptionService: InscriptionService,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId/bascule-jeunes-valides/status")
    async getBaculeJeunesValidesStatus(
        @Param("sessionId") sessionId: string,
    ): Promise<InscriptionRoutes["GetBasculeJeunesValides"]["response"]> {
        const traitement = await this.inscriptionService.getStatusValidation(
            sessionId,
            TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER,
        );
        return {
            simulation: await this.inscriptionService.getStatusSimulation(
                sessionId,
                TaskName.BACULE_JEUNES_VALIDES_SIMULATION,
            ),
            traitement: {
                ...traitement,
                lastCompletedAt: traitement.lastCompletedAt?.toISOString(),
            },
        };
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/bascule-jeunes-valides/simulation")
    async basuleJeunesValidesSimulation(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: PostSimulationsPayloadDto,
    ): Promise<InscriptionRoutes["PostBasculeJeunesValides"]["response"]> {
        const parameters: SimulationBasculeJeunesValidesTaskParameters = {
            sessionId,
            ...payload,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.BACULE_JEUNES_VALIDES_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation/:taskId/bascule-jeunes-valides/valider")
    async basuleJeunesValidesValider(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Param("taskId") taskId: string,
        @Body() payload: PostSimulationValiderPayloadDto,
    ): Promise<InscriptionRoutes["PostValiderBasculeJeunesValides"]["response"]> {
        const simulationTask = await this.taskGateway.findById(taskId);

        // On verifie qu'une simulation n'a pas déjà été affecté en amont
        const { status, lastCompletedAt } = await this.inscriptionService.getStatusValidation(
            sessionId,
            TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER,
        );

        if (
            [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(status) ||
            (lastCompletedAt && simulationTask.createdAt <= lastCompletedAt)
        ) {
            throw new FunctionalException(FunctionalExceptionCode.SIMULATION_OUTDATED);
        }

        const parameters: ValiderBasculeJeunesValidesTaskParameters = {
            sessionId,
            simulationTaskId: taskId,
            ...payload,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }
}
