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
import { PostSimulationsDesistementPayloadDto } from "./Desistement.validation";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ValiderAffectationHTSDromComTaskModel } from "@admin/core/sejours/phase1/affectation/ValiderAffectationHTSDromComTask.model";
import { FileGateway } from "@shared/core/File.gateway";

@Controller("desistement")
export class DesistementController {
    constructor(
        @Inject(Phase1Service) private readonly phase1Service: Phase1Service,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
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
        @Body() payload: PostSimulationsDesistementPayloadDto,
    ): Promise<DesistementRoutes["PostSimuler"]["response"]> {
        const affectationTask: ValiderAffectationHTSDromComTaskModel = await this.taskGateway.findById(
            payload.affectationTaskId,
        );
        if (!affectationTask.metadata?.results?.rapportKey) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Fichier associé à l'affectation introuvable",
            );
        }
        const parameters: DesisterSimulationTaskParameters = {
            sessionId,
            affectationTaskId: payload.affectationTaskId,
            affectationFileName: this.fileGateway.baseName(affectationTask.metadata.results.rapportKey),
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
    @Post("/:sessionId/simulation/:taskId/valider")
    async validerionDesister(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Param("taskId") taskId: string,
    ): Promise<DesistementRoutes["PostSimuler"]["response"]> {
        const simulationTask = await this.taskGateway.findById(taskId);

        // On verifie qu'une simulation n'a pas déjà été affecté en amont
        const { status, lastCompletedAt } = await this.phase1Service.getStatusValidation(
            sessionId,
            TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER,
        );

        if (
            [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(status as TaskStatus) ||
            (lastCompletedAt && simulationTask.createdAt <= lastCompletedAt)
        ) {
            throw new FunctionalException(FunctionalExceptionCode.SIMULATION_OUTDATED);
        }

        const parameters: DesisterValiderTaskParameters = {
            sessionId,
            simulationTaskId: taskId,
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
