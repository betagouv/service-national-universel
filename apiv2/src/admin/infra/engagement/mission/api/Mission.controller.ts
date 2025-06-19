import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Request, UseGuards } from "@nestjs/common";

import { canSearchInElasticSearch, MissionRoutes, TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { PostCandidaturesExportPayloadDto, PostMissionsExportPayloadDto } from "./Mission.validation";
import { ExportMissionCandidaturesTaskParameters, ExportMissionsTaskParameters } from "snu-lib";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";

@Controller("mission")
export class MissionController {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    @Post("/candidatures/export")
    async exportCandidatures(
        @Request() request: CustomRequest,
        @Body() payload: PostCandidaturesExportPayloadDto,
    ): Promise<MissionRoutes["PostCandidaturesExportRoute"]["response"]> {
        // TODO: use permission guard
        if (!canSearchInElasticSearch(request.user, "mission")) {
            throw new TechnicalException(TechnicalExceptionType.UNAUTORIZED, "mission.not_found");
        }

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
    async exportMissions(
        @Request() request: CustomRequest,
        @Body() payload: PostMissionsExportPayloadDto,
    ): Promise<MissionRoutes["PostMissionsExportRoute"]["response"]> {
        // TODO: use permission guard
        if (!canSearchInElasticSearch(request.user, "mission")) {
            throw new TechnicalException(TechnicalExceptionType.UNAUTORIZED, "mission.not_found");
        }

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
