import { Inject, Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskGateway } from "@task/core/Task.gateway";

import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { TaskModel } from "@task/core/Task.model";
import { ReferentielImportTaskAuthor } from "./ReferentielImportTask.model";

export const REQUIRED_COLUMN_NAMES = {
    [ReferentielTaskType.IMPORT_REGION_ACADEMIQUE]: [
        "Code région académique",
        "Région académique : Libellé région académique long", 
        "Zone région académique édition",
        "Région académique : Date de création",
        "Région académique : Date de dernière modification",
    ]
};

@Injectable()
export class ReferentielImportTaskService {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
    ) {}

    async import({
        importType,
        fileName,
        buffer,
        mimetype,
        auteur,
    }: {
        importType: typeof ReferentielTaskType[keyof typeof ReferentielTaskType];
        fileName: string;
        buffer: Buffer;
        mimetype: string;
        auteur: ReferentielImportTaskAuthor;
    }): Promise<TaskModel> {
        const dataToImport = await this.fileGateway.parseXLS<Record<string, string>>(buffer);

        if (dataToImport.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_EMPTY_FILE);
        }
        for (const column of REQUIRED_COLUMN_NAMES[importType]) {
            if (!dataToImport[0].hasOwnProperty(column)) {
                throw new FunctionalException(FunctionalExceptionCode.IMPORT_MISSING_COLUMN, column);
            }
        }

        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const s3File = await this.fileGateway.uploadFile(`file/admin/referentiel/${importType}/${timestamp}_${fileName}`, {
            data: buffer,
            mimetype,
        });

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
