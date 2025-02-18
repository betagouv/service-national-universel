import {
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Query,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { MIME_TYPES, ReferentielTaskType, TaskName, TaskStatus, ReferentielRoutes } from "snu-lib";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { TaskMapper } from "@task/infra/Task.mapper";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskGateway } from "@task/core/Task.gateway";
import { ReferentielImportTaskService } from "@admin/core/referentiel/ReferentielImportTask.service";
import { TaskModel } from "@task/core/Task.model";
import { ReferentielClasseService } from "@admin/core/referentiel/classe/ReferentielClasse.service";

const REFERENTIEL_TASK_NAMES = [TaskName.REFERENTIEL_IMPORT];
@Controller("referentiel")
export class ImportReferentielController {
    constructor(
        @Inject(ReferentielImportTaskService)
        private readonly referentielImportTaskService: ReferentielImportTaskService,
        @Inject(ReferentielClasseService) private readonly referentielClasseService: ReferentielClasseService,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    @Post("/import/:name")
    @UseGuards(SuperAdminGuard)
    @UseInterceptors(FileInterceptor("file"))
    async import(
        @Request() request: CustomRequest,
        @Param("name") name: string,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<ReferentielRoutes["Import"]["response"]> {
        // validate file format
        let importTask: TaskModel;

        if (!file || !file.originalname || (file.mimetype !== MIME_TYPES.EXCEL && file.mimetype !== MIME_TYPES.CSV)) {
            throw new FunctionalException(FunctionalExceptionCode.INVALID_FILE_FORMAT);
        }

        const auteur = {
            id: request.user.id,
            prenom: request.user.prenom,
            nom: request.user.nom,
            role: request.user.role,
            sousRole: request.user.sousRole,
            email: request.user.email,
        };

        switch (name) {
            case ReferentielTaskType.IMPORT_CLASSES:
                importTask = await this.referentielClasseService.import({
                    fileName: file.originalname,
                    buffer: file.buffer,
                    mimetype: file.mimetype,
                    auteur,
                });
                return TaskMapper.toDto(importTask);
            case ReferentielTaskType.IMPORT_ROUTES:
            case ReferentielTaskType.IMPORT_DEPARTEMENTS:
            case ReferentielTaskType.IMPORT_ACADEMIES:
            case ReferentielTaskType.IMPORT_REGIONS_ACADEMIQUES:
                importTask = await this.referentielImportTaskService.import({
                    importType: name,
                    fileName: file.originalname,
                    buffer: file.buffer,
                    mimetype: file.mimetype,
                    auteur,
                });
                return TaskMapper.toDto(importTask);
            default:
                throw new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID);
        }
    }

    @UseGuards(AdminGuard)
    @Get("/import")
    async getImports(
        @Query("name")
        name?: TaskName.REFERENTIEL_IMPORT,
        @Query("type")
        type?: string,
        @Query("status")
        status?: TaskStatus,
        @Query("sort")
        sort?: "ASC" | "DESC",
        @Query("limit")
        limit?: number,
    ): Promise<ReferentielRoutes["GetImports"]["response"]> {
        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (type) {
            filter["metadata.parameters.type"] = type;
        }
        const imports = await this.taskGateway.findByNames(name ? [name] : REFERENTIEL_TASK_NAMES, filter, sort, limit);
        return imports.map(TaskMapper.toDto);
    }
}
