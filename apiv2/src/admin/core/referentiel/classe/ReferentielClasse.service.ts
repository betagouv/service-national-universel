import { Inject, Injectable } from "@nestjs/common";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskModel } from "@task/core/Task.model";
import { MIME_TYPES, ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";
import { FilePath } from "../Referentiel";
import { ReferentielService } from "../Referentiel.service";
import {
    CreateReferentielImportTaskModel,
    ReferentielImportTaskAuthor,
    ReferentielImportTaskParameters,
} from "../routes/ReferentielImportTask.model";
import {
    ClasseDesisterXlsx,
    ClasseImportXlsx,
    ClasseRapport,
    DesisterClasseFileValidation,
    ImportClasseFileValidation,
} from "./ReferentielClasse.model";

@Injectable()
export class ReferentielClasseService {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly referentielService: ReferentielService,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
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
        const classesToImport = await this.fileGateway.parseXLS<ClasseImportXlsx>(buffer, {
            defval: "",
            sheetName: ImportClasseFileValidation.sheetName,
        });

        const classesToDesister = await this.fileGateway.parseXLS<ClasseDesisterXlsx>(buffer, {
            defval: "",
            sheetName: DesisterClasseFileValidation.sheetName,
        });

        let taskType: ReferentielTaskType | null = null;
        let missingColumns: string[] = [];
        if (classesToImport.length > 0 && classesToDesister.length === 0) {
            taskType = ReferentielTaskType.IMPORT_CLASSES;
            missingColumns = this.referentielService.getMissingColumns(
                ImportClasseFileValidation.requiredColumns,
                classesToImport[0],
            );
        } else if (classesToImport.length === 0 && classesToDesister.length > 0) {
            taskType = ReferentielTaskType.IMPORT_DESISTER_CLASSES;
            missingColumns = this.referentielService.getMissingColumns(
                DesisterClasseFileValidation.requiredColumns,
                classesToDesister[0],
            );
        } else if (classesToImport.length > 0 && classesToDesister.length > 0) {
            taskType = ReferentielTaskType.IMPORT_DESISTER_CLASSES_ET_IMPORTER_CLASSES;
            const missingColumnsImport = this.referentielService.getMissingColumns(
                ImportClasseFileValidation.requiredColumns,
                classesToImport[0],
            );
            missingColumns = [
                ...missingColumnsImport,
                ...this.referentielService.getMissingColumns(
                    DesisterClasseFileValidation.requiredColumns,
                    classesToDesister[0],
                ),
            ];
        } else if (classesToImport.length === 0 && classesToDesister.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_EMPTY_FILE);
        }

        if (missingColumns.length > 0) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_MISSING_COLUMN, missingColumns.join(", "));
        }

        if (!taskType) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_IMPLEMENTED_YET);
        }

        const timestamp = this.clockGateway.getNowSafeIsoDate();
        const folderPath = `${FilePath[ReferentielTaskType.IMPORT_CLASSES]}/export-${timestamp}`;
        const s3File = await this.fileGateway.uploadFile(`${folderPath}/${fileName}`, {
            data: buffer,
            mimetype,
        });

        const task: CreateReferentielImportTaskModel = {
            name: TaskName.REFERENTIEL_IMPORT,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    type: taskType,
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

    async processReport(parameters: ReferentielImportTaskParameters, ...reports: ClasseRapport[][]): Promise<string> {
        const sheetsReports = Object.fromEntries(reports.map((report, index) => [`rapport-${index + 1}`, report]));
        const fileBuffer = await this.fileGateway.generateExcel(sheetsReports);
        const timestamp = this.clockGateway.getNowSafeIsoDate();
        const reportName = `rapport-import-${parameters.type}-${timestamp}.xlsx`;
        const s3File = await this.fileGateway.uploadFile(`${parameters.folderPath}/${reportName}`, {
            data: fileBuffer,
            mimetype: MIME_TYPES.EXCEL,
        });

        //TODO : supprimer quand on aura l'UI des imports
        if (parameters.auteur.email) {
            this.notificationGateway.sendEmail<EmailParams>(
                {
                    to: [
                        {
                            email: parameters.auteur.email,
                            name: parameters.auteur.prenom + " " + parameters.auteur.nom,
                        },
                    ],
                    attachments: [{ fileName: reportName, filePath: s3File.Key }],
                },
                EmailTemplate.IMPORT_REFERENTIEL_GENERIQUE,
            );
        }

        return s3File.Key;
    }
}
