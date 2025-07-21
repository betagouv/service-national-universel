import { Body, Controller, Inject, Post, Request } from "@nestjs/common";

import { ExportJeunesTaskParameters, JeuneRoutes, ROLES, TaskName, TaskStatus, YOUNG_STATUS } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { PostJeunesExportPayloadDto, PostJeunesExportScolarisesPayloadDto } from "./Jeune.validation";
import { UseAnyGuard } from "@admin/infra/iam/guard/Any.guard";
import { ReferentRegionalGuard } from "@admin/infra/iam/guard/ReferentRegional.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { ReferentDepartementalGuard } from "@admin/infra/iam/guard/ReferentDepartemental.guard";
import { ResponsableGuard } from "@admin/infra/iam/guard/Responsable.guard";
import { SupervisorGuard } from "@admin/infra/iam/guard/Superviseur.guard";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ExporterJeuneService } from "@admin/core/sejours/phase1/jeune/ExporterJeune.service";

// ALLOWED STATUS FOR JEUNE EXPORT
const ALLOWED_STATUS_FOR_JEUNE_EXPORT = [
    YOUNG_STATUS.VALIDATED,
    YOUNG_STATUS.WITHDRAWN,
    YOUNG_STATUS.WAITING_LIST,
    YOUNG_STATUS.DELETED,
];

@Controller("jeune")
export class JeuneController {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly exporterJeuneService: ExporterJeuneService,
    ) {}

    @Post("/export")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async exportJeunes(
        @Request() request: CustomRequest,
        @Body() payload: PostJeunesExportPayloadDto,
    ): Promise<JeuneRoutes["PostJeunesExport"]["response"]> {
        const filters = payload.filters;

        if (
            filters.status.length &&
            !filters.status.every((status: any) => ALLOWED_STATUS_FOR_JEUNE_EXPORT.includes(status))
        ) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                "Le statut selectionné n'est pas autorisé",
            );
        } else if (filters.status.length === 0) {
            filters.status = ALLOWED_STATUS_FOR_JEUNE_EXPORT;
        }

        const parameters: ExportJeunesTaskParameters = {
            name: "volontaire",
            format: "volontaire",
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
            name: TaskName.JEUNE_EXPORT,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @Post("/export/scolarises")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async exportJeunesScolarise(
        @Request() request: CustomRequest,
        @Body() payload: PostJeunesExportScolarisesPayloadDto,
    ): Promise<JeuneRoutes["PostJeunesScolariseExport"]["response"]> {
        if (this.exporterJeuneService.isExportScolariseAllowed(request.user, payload.departement, payload.region)) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                "Vous n'avez pas les droits pour exporter les inscriptions de cette localisation",
            );
        }
        const filters = payload.filters;

        if (
            filters.status.length &&
            !filters.status.every((status: any) => ALLOWED_STATUS_FOR_JEUNE_EXPORT.includes(status))
        ) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                "Le statut selectionné n'est pas autorisé",
            );
        } else if (filters.status.length === 0) {
            filters.status = ALLOWED_STATUS_FOR_JEUNE_EXPORT;
        }

        if (payload.departement?.length) {
            filters.schoolDepartment = payload.departement;
        } else if (payload.region) {
            filters.schoolRegion = [payload.region];
        }

        const parameters: ExportJeunesTaskParameters = {
            name: "volontaire",
            format: "inscription",
            filters,
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
            name: TaskName.JEUNE_EXPORT,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }
}
