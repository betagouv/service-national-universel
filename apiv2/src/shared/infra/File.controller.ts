import { Controller, Get, Inject, Query, Res, UseGuards } from "@nestjs/common";

import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TechnicalException, TechnicalExceptionType } from "./TechnicalException";

// TODO: à déplacer dans le module "file"
@Controller("file")
export class FileController {
    constructor(@Inject(FileGateway) private readonly fileGateway: FileGateway) {}

    @UseGuards(AdminGuard)
    @Get("/")
    async downloadFile(
        @Res({ passthrough: true })
        res,
        @Query("key")
        key: string,
    ): Promise<Buffer> {
        if (!key) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        const file = await this.fileGateway.downloadFile(key);

        res.set({
            "Content-Type": file.ContentType,
            "Content-Lenght": file.ContentLength,
            "Content-Disposition": `attachment; filename=${file.FileName}`,
        });

        return file.Body;
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
