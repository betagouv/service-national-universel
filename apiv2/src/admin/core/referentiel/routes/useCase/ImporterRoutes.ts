import { Inject, Injectable, Logger } from "@nestjs/common";

import { UseCase } from "@shared/core/UseCase";
import { FileGateway } from "@shared/core/File.gateway";
import { ReferentielImportTaskParameters } from "../../ReferentielImportTask.model";

@Injectable()
export class ImporterRoutes implements UseCase<void> {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly logger: Logger,
    ) {}

    async execute(params: ReferentielImportTaskParameters): Promise<void> {
        this.logger.log("ImporterRoutes nothing to do");
    }
}
