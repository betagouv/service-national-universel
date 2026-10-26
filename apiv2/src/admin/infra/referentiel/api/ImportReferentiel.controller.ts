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

import { MIME_TYPES, ReferentielRoutes } from "snu-lib";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { StrictQueryPipe } from "@shared/infra/StrictQuery.pipe";
import { isFileContentMatchingMimetype, MAX_IMPORT_FILE_SIZE } from "@shared/infra/UploadFile";
import { TaskMapper } from "@task/infra/Task.mapper";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskGateway } from "@task/core/Task.gateway";
import { ReferentielImportTaskService } from "@admin/core/referentiel/ReferentielImportTask.service";
import { TaskModel } from "@task/core/Task.model";
import { isReferentielImportType } from "@admin/core/referentiel/Referentiel";
import { GetImportsQueryDto, REFERENTIEL_TASK_NAMES } from "./ImportReferentiel.validation";

@Controller("referentiel")
export class ImportReferentielController {
    constructor(
        @Inject(ReferentielImportTaskService)
        private readonly referentielImportTaskService: ReferentielImportTaskService,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    @Post("/import/:name")
    @UseGuards(SuperAdminGuard)
    @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_IMPORT_FILE_SIZE, files: 1 } }))
    async import(
        @Request() request: CustomRequest,
        @Param("name") name: string,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<ReferentielRoutes["Import"]["response"]> {
        // validate file format
        if (
            !file ||
            !file.originalname ||
            (file.mimetype !== MIME_TYPES.EXCEL && file.mimetype !== MIME_TYPES.CSV) ||
            !isFileContentMatchingMimetype(file)
        ) {
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

        // Les imports phase 1 (classes CLE, routes) sont supprimés : tout autre nom est refusé.
        if (!isReferentielImportType(name)) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID);
        }

        const importTask: TaskModel = await this.referentielImportTaskService.import({
            importType: name,
            fileName: file.originalname,
            buffer: file.buffer,
            mimetype: file.mimetype,
            auteur,
        });
        return TaskMapper.toDto(importTask);
    }

    @UseGuards(AdminGuard)
    @Get("/import")
    async getImports(
        @Query(StrictQueryPipe) { name, type, status, sort, limit }: GetImportsQueryDto,
    ): Promise<ReferentielRoutes["GetImports"]["response"]> {
        const filter: { [key: string]: string } = {};
        if (status) {
            filter.status = status;
        }
        if (type) {
            filter["metadata.parameters.type"] = type;
        }
        const imports = await this.taskGateway.findByNames(
            name ? [name] : REFERENTIEL_TASK_NAMES,
            filter,
            sort || undefined,
            limit ? Number(limit) : undefined,
        );
        return imports.map(TaskMapper.toDto);
    }
}
