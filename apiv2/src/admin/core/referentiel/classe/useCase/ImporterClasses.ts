import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { ClsService } from "nestjs-cls";
import { MIME_TYPES, STATUS_CLASSE, STATUS_PHASE1_CLASSE, TaskStatus } from "snu-lib";

import { ReferentielImportTaskParameters } from "../../routes/ReferentielImportTask.model";
import { ReferentielClasseMapper } from "../ReferentielClasse.mapper";
import { ClasseImportModel, ClasseImportReport, ClasseImportXslx } from "../ReferentielClasse.model";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";

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
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        private readonly logger: Logger,
    ) {}

    async execute(parameters: ReferentielImportTaskParameters): Promise<string> {
        const report: ClasseImportReport[] = [];

        try {
            const fileContent = await this.fileGateway.downloadFile(parameters.fileKey);
            const classesFromXslx = await this.fileGateway.parseXLS<ClasseImportXslx>(fileContent.Body, {
                sheetIndex: 0,
            });
            const mappedClasses = ReferentielClasseMapper.mapFromFile(classesFromXslx);

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
                    });
                    this.logger.warn(
                        `Error importing classe ${mappedClasse.classeId}: ${(error as Error)?.message}`,
                        ImporterClasses.name,
                    );
                }
            }
        } catch (error) {}
        const fileBuffer = await this.fileGateway.generateExcel({ rapport: report });
        const timestamp = this.clockGateway.getNowSafeIsoDate();
        const s3File = await this.fileGateway.uploadFile(
            `${parameters.folderPath}/rapport-classes-importees-${timestamp}.xlsx`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.CSV,
            },
        );
        return s3File.Key;
    }

    private async processClasse(classeImport: ClasseImportModel): Promise<ClasseImportReport> {
        // console.log("Processing classe", classeImport.classeId);
        // console.time("classeGateway.findById");
        const classe = await this.classeGateway.findById(classeImport.classeId);
        // console.timeEnd("classeGateway.findById");
        if (!classe) throw new Error("Classe not found");

        // console.time("sessionGateway.findBySnuId");
        const session = await this.sessionGateway.findBySnuId(classeImport.cohortCode);
        // console.timeEnd("sessionGateway.findBySnuId");
        if (!session) throw new Error("Session not found");

        if (session.id !== classe.sessionId) {
            await this.updateYoungCohorts(classe.id, session);
        }
        const updatedFields: string[] = [];
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

        if (classeImport.sessionCode) {
            // console.time("sessionGateway.findBySnuId");
            const sessionDetails = await this.sejourGateway.findBySejourSnuId(classeImport.sessionCode);
            // console.timeEnd("sessionGateway.findBySnuId");
            if (sessionDetails) {
                newClasseData.sessionId = sessionDetails.id;
                // console.time("addCenterAndPdrUpdates");
                await this.addCenterAndPdrUpdates(newClasseData, classeImport);
                // console.timeEnd("addCenterAndPdrUpdates");
            }
        } else {
            await this.classeGateway.update({ ...classe, ...newClasseData });

            return {
                classeId: classe.id,
                sessionCode: classeImport.sessionCode,
                cohortCode: classeImport.cohortCode,
                updatedFields: [],
                result: "error",
            };
        }

        console.time("classeGateway.update");
        await this.classeGateway.update({ ...classe, ...newClasseData });
        console.timeEnd("classeGateway.update");

        return {
            classeId: classe.id,
            sessionCode: classeImport.sessionCode,
            cohortCode: classeImport.cohortCode,
            updatedFields,
            result: "success",
        };
    }

    private async updateYoungCohorts(classeId: string, newSession: any): Promise<void> {
        console.time("findByClasseId");
        const jeunes = await this.jeuneGateway.findByClasseId(classeId);
        console.timeEnd("findByClasseId");

        console.time("jeuneGateway.update");
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
        console.timeEnd("jeuneGateway.update");
    }

    private async addCenterAndPdrUpdates(classe: ClasseModel, classeImport: ClasseImportModel): Promise<void> {
        if (classeImport.centerCode) {
            const center = await this.centreGateway.findByMatricule(classeImport.centerCode);
            if (center) {
                classe.centreCohesionId = center.id;

                if (classeImport.pdrCode) {
                    const pdr = await this.pdrGateway.findByMatricule(classeImport.pdrCode);
                    if (pdr) {
                        classe.pointDeRassemblementId = pdr.id;
                        classe.statutPhase1 = STATUS_PHASE1_CLASSE.AFFECTED;
                    }
                }
            }
        }
    }
}
