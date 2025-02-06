import { Body, Controller, Get, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";

import {
    InscriptionRoutes,
    TaskName,
    TaskStatus,
    ValiderBasculeJeunesNonValidesTaskParameters,
    SimulationBasculeJeunesNonValidesTaskParameters,
} from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";

import { PostSimulationsPayloadDto, PostSimulationValiderPayloadDto } from "./BasculeJeuneNonValides.validation";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { InscriptionService } from "@admin/core/sejours/phase1/inscription/Inscription.service";

@Controller("inscription")
export class BasculeJeuneNonValidesController {
    constructor(
        private readonly inscriptionService: InscriptionService,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId/bascule-jeunes-non-valides/status")
    async getBaculeJeunesNonValidesStatus(
        @Param("sessionId") sessionId: string,
    ): Promise<InscriptionRoutes["GetBasculeJeunesNonValides"]["response"]> {
        const traitement = await this.inscriptionService.getStatusValidation(
            sessionId,
            TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER,
        );
        return {
            simulation: await this.inscriptionService.getStatusSimulation(
                sessionId,
                TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION,
            ),
            traitement: {
                ...traitement,
                lastCompletedAt: traitement.lastCompletedAt?.toISOString(),
            },
        };
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/bascule-jeunes-non-valides/simulation")
    async basuleJeunesNonValidesSimulation(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: PostSimulationsPayloadDto,
    ): Promise<InscriptionRoutes["PostBasculeJeunesNonValides"]["response"]> {
        const parameters: SimulationBasculeJeunesNonValidesTaskParameters = {
            sessionId,
            status: payload.status,
            departements: payload.departements,
            niveauScolaires: payload.niveauScolaires,
            etranger: payload.etranger,
            avenir: payload.avenir,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation/:taskId/bascule-jeunes-non-valides/valider")
    async basuleJeunesNonValidesValider(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Param("taskId") taskId: string,
        @Body() payload: PostSimulationValiderPayloadDto,
    ): Promise<InscriptionRoutes["PostValiderBasculeJeunesNonValides"]["response"]> {
        const simulationTask = await this.taskGateway.findById(taskId);

        // On verifie qu'une simulation n'a pas déjà été affecté en amont
        const { status, lastCompletedAt } = await this.inscriptionService.getStatusValidation(
            sessionId,
            TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER,
        );

        if (
            [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(status) ||
            (lastCompletedAt && simulationTask.createdAt <= lastCompletedAt)
        ) {
            throw new FunctionalException(FunctionalExceptionCode.SIMULATION_OUTDATED);
        }

        const parameters: ValiderBasculeJeunesNonValidesTaskParameters = {
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
            name: TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }
}
