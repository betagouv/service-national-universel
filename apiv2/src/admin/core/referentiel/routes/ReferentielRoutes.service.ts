import { Inject, Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskGateway } from "@task/core/Task.gateway";

import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { TaskModel } from "@task/core/Task.model";
import { ReferentielImportTaskAuthor } from "./ReferentielImportTask.model";

const REQUIRED_COLUMN_NAMES = [
    "Session formule",
    "Code court de Route",
    "Commentaire interne sur l'enregistrement",
    "Session : Code de la session",
    "Session : Désignation de la session",
    "Session : Date de début de la session",
    "Session : Date de fin de la session",
    "Route",
    "Code point de rassemblement initial",
];

@Injectable()
export class ReferentielRoutesService {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
    ) {}

    async import({
        fileName,
        buffer,
        mimetype,
        auteur,
    }: {
        fileName: string;
        buffer: Buffer;
        mimetype: string;
        auteur: ReferentielImportTaskAuthor;
    }): Promise<TaskModel> {
        // parse file
        const routesToImport = await this.fileGateway.parseXLS<Record<string, string>>(buffer, {
            defval: "",
        });

        // check data validity
        if (routesToImport.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_EMPTY_FILE);
        }
        for (const column of REQUIRED_COLUMN_NAMES) {
            if (!routesToImport[0].hasOwnProperty(column)) {
                throw new FunctionalException(FunctionalExceptionCode.IMPORT_MISSING_COLUMN, column);
            }
        }

        // save file to s3
        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const s3File = await this.fileGateway.uploadFile(`file/admin/referentiel/routes/${timestamp}_${fileName}`, {
            data: buffer,
            mimetype,
        });

        const task = await this.taskGateway.create({
            name: TaskName.REFERENTIEL_IMPORT,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    type: ReferentielTaskType.IMPORT_ROUTES,
                    fileName,
                    fileKey: s3File.Key,
                    fileLineCount: routesToImport.length,
                    auteur,
                },
            },
        });

        return task;
    }
}
