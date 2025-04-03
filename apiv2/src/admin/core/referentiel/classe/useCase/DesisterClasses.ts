import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { Inject, Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { STATUS_CLASSE, YOUNG_STATUS } from "snu-lib";
import { ReferentielImportTaskParameters } from "../../routes/ReferentielImportTask.model";
import { ReferentielClasseMapper } from "../ReferentielClasse.mapper";
import {
    ClasseDesisterModel,
    ClasseDesisterRapport,
    ClasseDesisterXlsx,
    ClasseImportModel,
    ClasseImportXlsx,
    DesisterClasseFileValidation,
    ImportClasseFileValidation,
} from "../ReferentielClasse.model";
import { Transactional } from "@nestjs-cls/transactional";
@Injectable()
export class DesisterClasses implements UseCase<ClasseDesisterRapport[]> {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
    ) {}
    async execute(parameters: ReferentielImportTaskParameters): Promise<ClasseDesisterRapport[]> {
        const report: ClasseDesisterRapport[] = [];
        const fileContent = await this.fileGateway.downloadFile(parameters.fileKey);
        const classesFromXslx = await this.fileGateway.parseXLS<ClasseDesisterXlsx>(fileContent.Body, {
            sheetName: DesisterClasseFileValidation.sheetName,
        });
        const mappedClasses = ReferentielClasseMapper.mapDesisterClassesFromFile(classesFromXslx);

        const classesImportFromXslx = await this.fileGateway.parseXLS<ClasseImportXlsx>(fileContent.Body, {
            sheetName: ImportClasseFileValidation.sheetName,
        });
        const mappedClassesImport = ReferentielClasseMapper.mapImporterClassesFromFile(classesImportFromXslx);

        for (const mappedClasse of mappedClasses) {
            try {
                const result = await this.processClasse(mappedClasse, mappedClassesImport);
                report.push(result);
            } catch (error) {
                report.push({
                    classeId: mappedClasse.classeId,
                    error: (error as Error)?.message,
                    result: "error",
                    jeunesDesistesIds: "",
                });
            }
        }

        return report;
    }
    @Transactional()
    private async processClasse(
        classeToDesister: ClasseDesisterModel,
        classesImport: ClasseImportModel[],
    ): Promise<ClasseDesisterRapport> {
        if (!classeToDesister.classeId) {
            return {
                classeId: classeToDesister.classeId,
                error: "No classe ID found",
                result: "error",
                jeunesDesistesIds: "",
            };
        }
        // Vérifier si la classe existe dans l'onglet d'import
        if (classesImport.find((classe) => classe.classeId === classeToDesister.classeId)) {
            return {
                classeId: classeToDesister.classeId,
                error: "Classe existe dans les 2 onglets",
                result: "error",
                jeunesDesistesIds: "",
            };
        }

        // Désister classe
        const classeDesistee = await this.classeGateway.updateStatut(
            classeToDesister.classeId,
            STATUS_CLASSE.WITHDRAWN,
        );
        // Désister jeunes de la classe en évitant de désister les jeunes basculer sur HTS ayant garder un classeId
        const classe = await this.classeGateway.findById(classeToDesister.classeId);
        if (!classe || !classe.sessionId) {
            return {
                classeId: classeToDesister.classeId,
                error: "Classe introuvable en base de données",
                result: "error",
                jeunesDesistesIds: "",
            };
        }

        const jeunesToDesister = await this.jeuneGateway.findByClasseIdAndSessionId(
            classeToDesister.classeId,
            classe.sessionId,
        );
        // Filtrer les jeunes ayant le même cohortId que la classe
        const jeunesToDesisterList: JeuneModel[] = jeunesToDesister.map((jeune) => ({
            ...jeune,
            statut: YOUNG_STATUS.ABANDONED,
        }));

        await this.jeuneGateway.bulkUpdate(jeunesToDesisterList);

        return {
            classeId: classeDesistee.id,
            result: "success",
            error: "",
            jeunesDesistesIds: jeunesToDesisterList.map((jeune) => jeune.id)?.join(","),
        };
    }
}
