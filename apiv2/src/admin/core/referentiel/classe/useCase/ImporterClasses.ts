import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";

import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";
import { ReferentielImportTaskParameters } from "../../routes/ReferentielImportTask.model";
import { ReferentielClasseMapper } from "../ReferentielClasse.mapper";
import { ClasseImportModel, ClasseImportRapport, ClasseImportXslx } from "../ReferentielClasse.model";
import { ReferentielClasseService } from "../ReferentielClasse.service";

@Injectable()
export class ImporterClasses implements UseCase<string> {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(CentreGateway) private readonly centreGateway: CentreGateway,
        @Inject(PointDeRassemblementGateway) private readonly pdrGateway: PointDeRassemblementGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        private readonly referentielClasseService: ReferentielClasseService,
        private readonly logger: Logger,
    ) {}

    async execute(parameters: ReferentielImportTaskParameters): Promise<string> {
        const report: ClasseImportRapport[] = [];
        const fileContent = await this.fileGateway.downloadFile(parameters.fileKey);
        const classesFromXslx = await this.fileGateway.parseXLS<ClasseImportXslx>(fileContent.Body, {
            sheetIndex: 0,
        });
        const mappedClasses = ReferentielClasseMapper.mapImporterClassesFromFile(classesFromXslx);

        for (const mappedClasse of mappedClasses) {
            try {
                const result = await this.processClasse(mappedClasse);
                report.push(result);
                this.logger.log(`Classe ${mappedClasse.classeId} imported successfully`, ImporterClasses.name);
            } catch (error) {
                report.push({
                    classeId: mappedClasse.classeId,
                    sessionCode: mappedClasse.sessionCode,
                    cohortCode: mappedClasse.cohortCode,
                    error: (error as Error)?.message,
                    result: "error",
                });
                this.logger.warn(
                    `Error importing classe ${mappedClasse.classeId}: ${(error as Error)?.message}`,
                    ImporterClasses.name,
                );
            }
        }
        return this.referentielClasseService.processReport(parameters, report);
    }

    private async processClasse(classeImport: ClasseImportModel): Promise<ClasseImportRapport> {
        const classe = await this.classeGateway.findById(classeImport.classeId);
        if (!classe) {
            throw new Error("Classe non trouvée en base");
        }

        const session = await this.sessionGateway.findBySnuId(classeImport.cohortCode);
        if (!session) {
            throw new Error("Session non trouvée en base");
        }

        const updatedFields: string[] = [];

        if (session.id !== classe.sessionId) {
            await this.updateYoungCohorts(classe.id, session);
            updatedFields.push("jeune.sessionId", "jeune.sessionNom");
        }
        updatedFields.push("sessionId", "sessionNom", "placesTotal");

        const newClasseData: ClasseModel = {
            ...classe,
            sessionId: session.id,
            sessionNom: session.nom,
            placesTotal: classeImport.classeTotalSeats ?? 0,
        };
        if (classe.statut === STATUS_CLASSE.VERIFIED) {
            newClasseData.statut = STATUS_CLASSE.ASSIGNED;
            updatedFields.push("statut");
        }
        const sejour = await this.sejourGateway.findBySejourSnuId(classeImport.sessionCode);
        if (!classeImport.sessionCode || !sejour) {
            let errorMessage = '"Session : Code de la session_Désignation du centre" est manquant';
            if (!sejour) {
                errorMessage = "Sejour non trouvé en base";
            }
            const updatedClasse = await this.classeGateway.update({ ...classe, ...newClasseData });

            return {
                classeId: updatedClasse.id,
                sessionId: session.id,
                sessionName: session.nom,
                classeStatus: updatedClasse.statut,
                classeTotalSeats: updatedClasse.placesTotal,
                sessionCode: classeImport.sessionCode,
                cohortCode: classeImport.cohortCode,
                updated: updatedFields.join(", "),
                error: errorMessage,
                result: "error",
            };
        }

        newClasseData.sejourId = sejour.id;
        updatedFields.push(...(await this.addCenterAndPdrUpdates(newClasseData, classeImport)));

        const updatedClasse = await this.classeGateway.update({ ...classe, ...newClasseData });

        return {
            classeId: updatedClasse.id,
            sessionId: session.id,
            sessionName: session.nom,
            classeStatus: updatedClasse.statut,
            classeTotalSeats: updatedClasse.placesTotal,
            sessionCode: classeImport.sessionCode,
            cohortCode: classeImport.cohortCode,
            updated: updatedFields.join(", "),
            result: "success",
        };
    }

    private async updateYoungCohorts(classeId: string, newSession: any): Promise<void> {
        const jeunes = await this.jeuneGateway.findByClasseId(classeId);
        const jeunesUpdatedList: JeuneModel[] = [];
        for (const jeune of jeunes) {
            jeunesUpdatedList.push({
                ...jeune,
                sessionId: newSession.id,
                sessionNom: newSession.nom,
                originalSessionId: jeune.sessionId,
                originalSessionNom: jeune.sessionNom,
                sessionChangeReason: "Import SI-SNU",
            });
        }
        await this.jeuneGateway.bulkUpdate(jeunesUpdatedList);
        this.logger.log(
            `Updated ${jeunesUpdatedList.length} jeunes with new session ${newSession.nom}`,
            ImporterClasses.name,
        );
    }

    private async addCenterAndPdrUpdates(classe: ClasseModel, classeImport: ClasseImportModel): Promise<string[]> {
        const updatedFields: string[] = [];
        if (classeImport.centerCode) {
            const center = await this.centreGateway.findByMatricule(classeImport.centerCode);
            if (center) {
                classe.centreCohesionId = center.id;
                updatedFields.push("centreCohesionId");

                if (classeImport.pdrCode) {
                    const pdr = await this.pdrGateway.findByMatricule(classeImport.pdrCode);
                    if (pdr) {
                        classe.pointDeRassemblementId = pdr.id;
                        classe.statutPhase1 = STATUS_PHASE1_CLASSE.AFFECTED;
                        updatedFields.push("pointDeRassemblementId", "statutPhase1");
                    }
                }
            }
        }
        return updatedFields;
    }
}
