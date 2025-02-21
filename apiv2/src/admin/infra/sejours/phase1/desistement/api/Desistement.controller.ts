import { Body, Controller, Get, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import { TaskName, TaskStatus, DesisterTaskParameters, DesistementRoutes } from "snu-lib";
import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { DesisterPostAffectation } from "@admin/core/sejours/phase1/desistement/DesisterPostAffectation";

@Controller("desistement")
export class DesistementController {
    constructor(
        private readonly desisterPostAffectation: DesisterPostAffectation,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId/preview/:affectationTaskId")
    async previsualiser(
        @Param("sessionId") sessionId: string,
        @Param("affectationTaskId") affectationTaskId: string,
    ): Promise<DesistementRoutes["GetPreview"]["response"]> {
        const result = await this.desisterPostAffectation.preview({
            sessionId,
            affectationTaskId,
        });
        return result;
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId")
    async desister(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: { affectationTaskId: string },
    ): Promise<DesistementRoutes["Post"]["response"]> {
        const parameters: DesisterTaskParameters = {
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
            name: TaskName.DESISTEMENT_POST_AFFECTATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }
}
