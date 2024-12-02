import { Controller, Param, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { MIME_TYPES, ReferentielTaskType, ReferentielRoutes } from "snu-lib";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { TaskMapper } from "@task/infra/Task.mapper";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { ReferentielRoutesService } from "@admin/core/referentiel/routes/ReferentielRoutes.service";

@Controller("referentiel")
export class ImportReferentielController {
    constructor(private readonly routeService: ReferentielRoutesService) {}

    @Post("/import/:name")
    @UseGuards(SuperAdminGuard)
    @UseInterceptors(FileInterceptor("file"))
    async import(
        @Request() request: CustomRequest,
        @Param("name") name: string,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<ReferentielRoutes["Import"]["response"]> {
        // validate file format
        if (!file || !file.originalname || (file.mimetype !== MIME_TYPES.EXCEL && file.mimetype !== MIME_TYPES.CSV)) {
            throw new FunctionalException(FunctionalExceptionCode.INVALID_FILE_FORMAT);
        }

        const auteur = {
            id: request.user.id,
            prenom: request.user.prenom,
            nom: request.user.nom,
            role: request.user.role,
            sousRole: request.user.sousRole,
        };

        switch (name) {
            case ReferentielTaskType.IMPORT_ROUTES:
                const fichierSISnu = await this.routeService.import({
                    fileName: file.originalname,
                    buffer: file.buffer,
                    mimetype: file.mimetype,
                    auteur,
                });
                return TaskMapper.toDto(fichierSISnu);
            default:
                throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
    }
}
