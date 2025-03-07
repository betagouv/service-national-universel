import { Inject, Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskGateway } from "@task/core/Task.gateway";

import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { TaskModel } from "@task/core/Task.model";
import { ReferentielImportTaskAuthor } from "./ReferentielImportTask.model";
import { FilePath, IMPORT_REQUIRED_COLUMN_NAMES, IMPORT_TAB_NAMES } from "./Referentiel";
import { ClockGateway } from "@shared/core/Clock.gateway";

@Injectable()
export class ReferentielImportTaskService {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
    ) {}

    async import({
        importType,
        fileName,
        buffer,
        mimetype,
        auteur,
    }: {
        importType: (typeof ReferentielTaskType)[keyof typeof ReferentielTaskType];
        fileName: string;
        buffer: Buffer;
        mimetype: string;
        auteur: ReferentielImportTaskAuthor;
    }): Promise<TaskModel> {
        const dataToImport = await this.fileGateway.parseXLS<Record<string, string>>(buffer, {
            sheetName: IMPORT_TAB_NAMES[importType],
            defval: "",
        });

        if (dataToImport.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_EMPTY_FILE);
        }
        for (const column of IMPORT_REQUIRED_COLUMN_NAMES[importType]) {
            if (!dataToImport[0].hasOwnProperty(column)) {
                throw new FunctionalException(FunctionalExceptionCode.IMPORT_MISSING_COLUMN, column);
            }
        }

        const timestamp = this.clockGateway.formatSafeIsoDate(this.clockGateway.now());
        const folderPath = `${FilePath[importType]}/export-${timestamp}`;
        const s3File = await this.fileGateway.uploadFile(`${folderPath}/${fileName}`, {
            data: buffer,
            mimetype,
        });

        // TODO: a quoi sert le folderPath
        const task = await this.taskGateway.create({
            name: TaskName.REFERENTIEL_IMPORT,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    type: importType,
                    fileName,
                    fileKey: s3File.Key,
                    fileLineCount: dataToImport.length,
                    auteur,
                },
            },
        });

        return task;
    }
}
