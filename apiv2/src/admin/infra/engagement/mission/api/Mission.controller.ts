import { Body, Controller, Inject, Post, Request } from "@nestjs/common";

import { MissionRoutes, TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { PostCandidaturesExportPayloadDto, PostMissionsExportPayloadDto } from "./Mission.validation";
import { ExportMissionCandidaturesTaskParameters, ExportMissionsTaskParameters } from "snu-lib";
import { UseAnyGuard } from "@admin/infra/iam/guard/Any.guard";
import { ReferentRegionalGuard } from "@admin/infra/iam/guard/ReferentRegional.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { ReferentDepartementalGuard } from "@admin/infra/iam/guard/ReferentDepartemental.guard";
import { ResponsableGuard } from "@admin/infra/iam/guard/Responsable.guard";
import { SupervisorGuard } from "@admin/infra/iam/guard/Superviseur.guard";

@Controller("mission")
export class MissionController {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    @Post("/candidatures/export")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async exportCandidatures(
        @Request() request: CustomRequest,
        @Body() payload: PostCandidaturesExportPayloadDto,
    ): Promise<MissionRoutes["PostCandidaturesExportRoute"]["response"]> {
        const parameters: ExportMissionCandidaturesTaskParameters = {
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
            name: TaskName.MISSION_EXPORT_CANDIDATURES,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @Post("/export")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async exportMissions(
        @Request() request: CustomRequest,
        @Body() payload: PostMissionsExportPayloadDto,
    ): Promise<MissionRoutes["PostMissionsExportRoute"]["response"]> {
        const parameters: ExportMissionsTaskParameters = {
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
            name: TaskName.MISSION_EXPORT,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }
}
