import { Inject, Injectable } from "@nestjs/common";
import { RegionAcademiqueGateway } from "./RegionAcademique.gateway";
import { ImportRegionAcademiqueModel, RegionAcademiqueImportRapport, RegionAcademiqueModel } from "./RegionAcademique.model";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ReferentielImportTaskParameters } from "../ReferentielImportTask.model";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { MIME_TYPES } from "snu-lib";

@Injectable()
export class RegionAcademiqueImportService {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(RegionAcademiqueGateway) private readonly regionAcademiqueGateway: RegionAcademiqueGateway,
    ) { }

    async import(regionAcademique: ImportRegionAcademiqueModel): Promise<RegionAcademiqueModel> {
        const regionAcademiqueDB = await this.regionAcademiqueGateway.findByCode(regionAcademique.code);

        if (!regionAcademiqueDB) {
            return this.regionAcademiqueGateway.create(regionAcademique);
        }

        if (this.canBeUpdated(regionAcademique, regionAcademiqueDB)) {
            return this.regionAcademiqueGateway.update({
                ...regionAcademique,
                id: regionAcademiqueDB.id
            } as RegionAcademiqueModel);
        }

        return regionAcademiqueDB;
    }

    async processReport(parameters: ReferentielImportTaskParameters, ...reports: RegionAcademiqueImportRapport[][]): Promise<string> {
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
