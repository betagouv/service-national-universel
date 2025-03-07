import { Inject, Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ReferentielImportTaskParameters } from "../ReferentielImportTask.model";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { MIME_TYPES } from "snu-lib";
import { DepartementGateway } from "./Departement.gateway";
import { DepartementImportRapport, DepartementModel, ImportDepartementModel } from "./Departement.model";

@Injectable()
export class DepartementImportService {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(DepartementGateway) private readonly departementGateway: DepartementGateway,
    ) {}

    async import(departement: ImportDepartementModel): Promise<DepartementModel> {
        const departementDB = await this.departementGateway.findByCode(departement.code);

        if (!departementDB) {
            return this.departementGateway.create(departement);
        }

        if (this.canBeUpdated(departement, departementDB)) {
            return this.departementGateway.update({
                ...departement,
                id: departementDB.id,
            } as DepartementModel);
        }

        return departementDB;
    }

    async processReport(
        parameters: ReferentielImportTaskParameters,
        ...reports: DepartementImportRapport[][]
    ): Promise<string> {
        const sheetsReports = Object.fromEntries(reports.map((report, index) => [`rapport-${index + 1}`, report]));
        const fileBuffer = await this.fileGateway.generateExcel(sheetsReports);
        const timestamp = this.clockGateway.formatSafeIsoDate(this.clockGateway.now());
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
