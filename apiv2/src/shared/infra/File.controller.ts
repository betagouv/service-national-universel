import { Controller, Get, Inject, Query, Request, Res, UseGuards } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TechnicalException, TechnicalExceptionType } from "./TechnicalException";
import { PermissionAccessControl, PermissionGuard } from "@auth/infra/guard/Permissions.guard";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";
import { CustomRequest } from "./CustomRequest";
import { FileAccessService } from "./FileAccess.service";

// TODO: à déplacer dans le module "file"
@Controller("file")
export class FileController {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly fileAccessService: FileAccessService,
    ) {}

    @Get("/")
    @UseGuards(PermissionGuard)
    @PermissionAccessControl([{ resource: PERMISSION_RESOURCES.EXPORT, action: PERMISSION_ACTIONS.READ }])
    async downloadFile(
        @Res({ passthrough: true })
        res,
        @Query("key")
        key: string,
        @Request() request: CustomRequest,
    ): Promise<Buffer> {
        if (!key) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        // EXPORT:READ est accordée sans policy : sans ce rattachement, la clé S3 était libre.
        await this.fileAccessService.verifierAcces(key, request.user);
        const file = await this.fileGateway.downloadFile(key);

        res.set({
            "Content-Type": file.ContentType,
            "Content-Lenght": file.ContentLength,
            "Content-Disposition": `attachment; filename=${file.FileName}`,
        });

        return file.Body;
    }

    @Get("/signed-url")
    @UseGuards(PermissionGuard)
    @PermissionAccessControl([{ resource: PERMISSION_RESOURCES.EXPORT, action: PERMISSION_ACTIONS.READ }])
    async getFileSignedUrlFromKey(
        @Query("key") key: string,
        @Request() request: CustomRequest,
    ): Promise<{ url: string }> {
        await this.fileAccessService.verifierAcces(key, request.user);
        if (!(await this.fileGateway.remoteFileExists(key))) {
            throw new FunctionalException(FunctionalExceptionCode.FILE_NOT_AVAILABLE_FOR_DOWNLOAD, key);
        }

        return { url: await this.fileGateway.getFileSignedUrlFromKey(key) };
    }

    @Get("/public")
    async downloadPublicFile(
        @Res({ passthrough: true })
        res,
        @Query("key")
        key: string,
    ): Promise<Buffer> {
        if (!key) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        if (!key.startsWith("public/")) {
            throw new TechnicalException(TechnicalExceptionType.FORBIDDEN);
        }
        const file = await this.fileGateway.downloadFile(key);

        res.set({
            "Content-Type": file.ContentType,
            "Content-Lenght": file.ContentLength,
            "Content-Disposition": `attachment; filename=${file.FileName}`,
        });

        return file.Body;
    }
}
