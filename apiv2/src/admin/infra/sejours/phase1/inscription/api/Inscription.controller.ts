import { Body, Controller, Inject, Post, Request } from "@nestjs/common";

import { ExportInscriptionsTaskParameters, InscriptionRoutes, TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { PostInscriptionsExportPayloadDto } from "./Inscription.validation";
import { UseAnyGuard } from "@admin/infra/iam/guard/Any.guard";
import { ReferentRegionalGuard } from "@admin/infra/iam/guard/ReferentRegional.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { ReferentDepartementalGuard } from "@admin/infra/iam/guard/ReferentDepartemental.guard";
import { ResponsableGuard } from "@admin/infra/iam/guard/Responsable.guard";
import { SupervisorGuard } from "@admin/infra/iam/guard/Superviseur.guard";

@Controller("inscription")
export class InscriptionController {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    @Post("/export")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async exportInscriptions(
        @Request() request: CustomRequest,
        @Body() payload: PostInscriptionsExportPayloadDto,
    ): Promise<InscriptionRoutes["PostInscriptionsExport"]["response"]> {
        const parameters: ExportInscriptionsTaskParameters = {
            filters: payload.filters,
            fields: payload.fields,
            searchTerm: payload.searchTerm,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.INSCRIPTION_EXPORT,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }
}
