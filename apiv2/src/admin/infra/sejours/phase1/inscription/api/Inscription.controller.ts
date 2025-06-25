import { Body, Controller, Inject, Post, Request } from "@nestjs/common";

import { ExportJeunesTaskParameters, InscriptionRoutes, TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { PostInscriptionsExportPayloadDto, PostInscriptionsExportScolarisesPayloadDto } from "./Inscription.validation";
import { UseAnyGuard } from "@admin/infra/iam/guard/Any.guard";
import { ReferentRegionalGuard } from "@admin/infra/iam/guard/ReferentRegional.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { ReferentDepartementalGuard } from "@admin/infra/iam/guard/ReferentDepartemental.guard";
import { ResponsableGuard } from "@admin/infra/iam/guard/Responsable.guard";
import { SupervisorGuard } from "@admin/infra/iam/guard/Superviseur.guard";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ExporterJeuneService } from "@admin/core/sejours/phase1/jeune/ExporterJeune.service";

@Controller("inscription")
export class InscriptionController {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly exporterJeuneService: ExporterJeuneService,
    ) {}

    @Post("/export")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async exportInscriptions(
        @Request() request: CustomRequest,
        @Body() payload: PostInscriptionsExportPayloadDto,
    ): Promise<InscriptionRoutes["PostInscriptionsExport"]["response"]> {
        const parameters: ExportJeunesTaskParameters = {
            format: "inscription",
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
    async exportInscriptionsScolarise(
        @Request() request: CustomRequest,
        @Body() payload: PostInscriptionsExportScolarisesPayloadDto,
    ): Promise<InscriptionRoutes["PostInscriptionsScolariseExport"]["response"]> {
        if (this.exporterJeuneService.isExportScolariseAllowed(request.user, payload.departement, payload.region)) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                "Vous n'avez pas les droits pour exporter les inscriptions de cette localisation",
            );
        }

        const filters = payload.filters;

        if (payload.departement) {
            filters.schoolDepartment = payload.departement;
        } else if (payload.region) {
            filters.schoolRegion = payload.region;
        }

        const parameters: ExportJeunesTaskParameters = {
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
