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
    ClasseDesisterXslx,
    DESISTER_CLASSES_ONGLET,
} from "../ReferentielClasse.model";
import { ReferentielClasseService } from "../ReferentielClasse.service";
Injectable();
export class DesisterClasses implements UseCase<string> {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        private readonly referentielClasseService: ReferentielClasseService,
    ) {}
    async execute(parameters: ReferentielImportTaskParameters): Promise<string> {
        //
        const report: ClasseDesisterRapport[] = [];
        const fileContent = await this.fileGateway.downloadFile(parameters.fileKey);
        const classesFromXslx = await this.fileGateway.parseXLS<ClasseDesisterXslx>(fileContent.Body, {
            sheetName: DESISTER_CLASSES_ONGLET,
        });
        const mappedClasses = ReferentielClasseMapper.mapDesisterClassesFromFile(classesFromXslx);

        for (const mappedClasse of mappedClasses) {
            try {
                const result = await this.processClasse(mappedClasse);
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

        return this.referentielClasseService.processReport(parameters, report);
    }
    async processClasse(classeToDesister: ClasseDesisterModel): Promise<ClasseDesisterRapport> {
        // Désister classe
        const classeDesistee = await this.classeGateway.updateStatut(
            classeToDesister.classeId,
            STATUS_CLASSE.WITHDRAWN,
        );
        // Désister jeunes de la classe
        const jeunesToDesister = await this.jeuneGateway.findByClasseId(classeToDesister.classeId);
        const jeunesToDesisterList: JeuneModel[] = [];
        for (const jeune of jeunesToDesister) {
            jeunesToDesisterList.push({
                ...jeune,
                statut: YOUNG_STATUS.ABANDONED,
            });
        }
        await this.jeuneGateway.bulkUpdate(jeunesToDesisterList);

        return {
            classeId: classeDesistee.id,
            result: "success",
            jeunesDesistesIds: jeunesToDesisterList.map((jeune) => jeune.id)?.join(","),
        };
    }
}
