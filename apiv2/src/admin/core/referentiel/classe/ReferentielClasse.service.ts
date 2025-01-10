import { Inject, Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskModel } from "@task/core/Task.model";
import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { ClasseImportXslx } from "./ReferentielClasse.model";
import { FilePath } from "../Referentiel";
import {
    CreateReferentielImportTaskModel,
    ReferentielImportTaskAuthor,
    ReferentielImportTaskModel,
} from "../routes/ReferentielImportTask.model";
import { ReferentielService } from "../Referentiel.service";
import { ClockGateway } from "@shared/core/Clock.gateway";

const REQUIRED_COLUMN_NAMES = [
    "Session formule",
    "Identifiant de la classe engagée",
    "Effectif de jeunes concernés",
    "Session : Code de la session",
    "Désignation du centre",
];

@Injectable()
export class ReferentielClasseService {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly referentielService: ReferentielService,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
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
        // Parse file
        const classesToImport = await this.fileGateway.parseXLS<ClasseImportXslx>(buffer, {
            defval: "",
        });

        // Validate data
        if (classesToImport.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_EMPTY_FILE);
        }

        const missingColumns = this.referentielService.getMissingColumns(REQUIRED_COLUMN_NAMES, classesToImport[0]);
        if (missingColumns.length > 0) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_MISSING_COLUMN, missingColumns.join(", "));
        }

        // Save file to S3
        const timestamp = this.clockGateway.getNowSafeIsoDate();
        const folderPath = `${FilePath.CLASSES}/export-${timestamp}`;
        const s3File = await this.fileGateway.uploadFile(`${folderPath}/${fileName}`, {
            data: buffer,
            mimetype,
        });

        // Create task
        const task: CreateReferentielImportTaskModel = {
            name: TaskName.REFERENTIEL_IMPORT,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    type: ReferentielTaskType.IMPORT_CLASSES,
                    fileName,
                    fileKey: s3File.Key,
                    fileLineCount: classesToImport.length,
                    folderPath,
                    auteur,
                },
            },
        };
        const createdTask = await this.taskGateway.create(task);
        return createdTask;
    }
}
