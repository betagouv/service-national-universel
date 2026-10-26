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
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

// Chaque export est une tâche lourde (recherche ES complète + génération Excel) : on borne
// le nombre d'exports non terminés par utilisateur.
export const MAX_EXPORTS_EN_ATTENTE_PAR_UTILISATEUR = 3;
const MISSION_EXPORT_TASK_NAMES = [TaskName.MISSION_EXPORT, TaskName.MISSION_EXPORT_CANDIDATURES];
// Une tâche restée bloquée au-delà ne doit pas empêcher l'utilisateur d'exporter indéfiniment.
const FENETRE_EXPORTS_EN_ATTENTE_MS = 24 * 60 * 60 * 1000;

@Controller("mission")
export class MissionController {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    private async assertExportsEnAttenteBornes(userId: string | undefined): Promise<void> {
        if (!userId) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "utilisateur inconnu");
        }
        const exportsRecents = await this.taskGateway.findByNames(
            MISSION_EXPORT_TASK_NAMES,
            { "metadata.parameters.auteur.id": userId },
            "DESC",
            20,
        );
        const depuis = Date.now() - FENETRE_EXPORTS_EN_ATTENTE_MS;
        const enAttente = exportsRecents.filter(
            (task) =>
                (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS) &&
                new Date(task.createdAt).getTime() > depuis,
        );
        if (enAttente.length >= MAX_EXPORTS_EN_ATTENTE_PAR_UTILISATEUR) {
            throw new FunctionalException(
                FunctionalExceptionCode.TOO_MANY_PENDING_EXPORTS,
                "Des exports sont déjà en cours : attendez leur fin avant d'en lancer un nouveau",
            );
        }
    }

    @Post("/candidatures/export")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async exportCandidatures(
        @Request() request: CustomRequest,
        @Body() payload: PostCandidaturesExportPayloadDto,
    ): Promise<MissionRoutes["PostCandidaturesExportRoute"]["response"]> {
        await this.assertExportsEnAttenteBornes(request.user.id);
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
        await this.assertExportsEnAttenteBornes(request.user.id);
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
