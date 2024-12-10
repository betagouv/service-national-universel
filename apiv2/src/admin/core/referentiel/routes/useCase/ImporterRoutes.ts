import { Inject, Injectable } from "@nestjs/common";

import { UseCase } from "@shared/core/UseCase";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ReferentielImportTaskParameters } from "../../ReferentielImportTask.model";

@Injectable()
export class ImporterRoutes implements UseCase<void> {
    constructor(@Inject(FileGateway) private readonly fileGateway: FileGateway) {}

    async execute(params: ReferentielImportTaskParameters): Promise<void> {
        throw new FunctionalException(FunctionalExceptionCode.NOT_IMPLEMENTED_YET);
    }
}
