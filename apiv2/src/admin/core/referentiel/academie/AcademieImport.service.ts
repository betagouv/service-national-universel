import { Inject, Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ReferentielImportTaskParameters } from "../ReferentielImportTask.model";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { MIME_TYPES } from "snu-lib";
import { AcademieGateway } from "./Academie.gateway";
import { AcademieImportRapport, AcademieModel, ImportAcademieModel } from "./Academie.model";

@Injectable()
export class AcademieImportService {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(AcademieGateway) private readonly academieGateway: AcademieGateway,
    ) { }

    async import(academie: ImportAcademieModel): Promise<AcademieModel> {
        const academieDB = await this.academieGateway.findByCode(academie.code);
        
        if (!academieDB) {
            return this.academieGateway.create(academie);
        }

        if (this.canBeUpdated(academie, academieDB)) {
            return this.academieGateway.update({
                ...academie,
                id: academieDB.id
            } as AcademieModel);
        }

        return academieDB;
    }

    async processReport(parameters: ReferentielImportTaskParameters, ...reports: AcademieImportRapport[][]): Promise<string> {
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

    private canBeUpdated(siEntity, internalEntity) {
        return siEntity.dateDerniereModificationSI > internalEntity.dateDerniereModificationSI;
    }
}
