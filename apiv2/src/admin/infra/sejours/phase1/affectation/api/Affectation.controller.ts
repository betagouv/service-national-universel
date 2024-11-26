import { Body, Controller, ExecutionContext, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";

import {
    AffectationRoutes,
    department2region,
    departmentList,
    GRADES,
    RegionsHorsMetropole,
    TaskName,
    TaskStatus,
} from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";

@Controller("affectation")
export class AffectationController {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulations")
    async simulate(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: AffectationRoutes["PostSimulationsRoute"]["payload"],
    ): Promise<AffectationRoutes["PostSimulationsRoute"]["response"]> {
        // TODO: add payload validation
        const task = await this.taskGateway.create({
            name: TaskName.AFFECTATION_HTS_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    sessionId,
                    departements: payload.departements,
                    niveauScolaires: payload.niveauScolaires,
                    changementDepartements: payload.changementDepartements,
                    etranger: payload.etranger,
                    affecterPDR: payload.affecterPDR,
                    auteur: {
                        id: request.user.id,
                        prenom: request.user.prenom,
                        nom: request.user.nom,
                        role: request.user.role,
                        sousRole: request.user.sousRole,
                    },
                },
            },
        });
        return TaskMapper.toDto(task);
    }
}
