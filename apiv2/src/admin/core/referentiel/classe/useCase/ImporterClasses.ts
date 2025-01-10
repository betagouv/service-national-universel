import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { Inject, Injectable } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { ClsService } from "nestjs-cls";
import { MIME_TYPES, TaskStatus } from "snu-lib";
import { ReferentielImportTaskParameters } from "../../routes/ReferentielImportTask.model";
import { ReferentielClasseMapper } from "../ReferentielClasse.mapper";
import { ClasseImportModel, ClasseImportXslx } from "../ReferentielClasse.model";

interface ClasseUpdateReport {
    id: string;
    status: "success" | "error";
    error?: string;
}

@Injectable()
export class ImporterClasses implements UseCase<string> {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(CentreGateway) private readonly centreGateway: CentreGateway,
        @Inject(PointDeRassemblementGateway) private readonly pdrGateway: PointDeRassemblementGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        private readonly cls: ClsService,
    ) {}

    async execute(parameters: ReferentielImportTaskParameters): Promise<string> {
        let task;
        const report: ClasseUpdateReport[] = [];

        try {
            const fileContent = await this.fileGateway.downloadFile(parameters.fileKey);
            const classesFromXslx = await this.fileGateway.parseXLS<ClasseImportXslx>(fileContent.Body, {
                sheetIndex: 0,
            });
            const mappedClasses = ReferentielClasseMapper.mapFromFile(classesFromXslx);

            for (const classeData of mappedClasses) {
                try {
                    const result = await this.processClasse(classeData);
                    report.push(result);
                } catch (error) {
                    report.push({
                        id: classeData.classeId,
                        status: "error",
                        error: (error as Error)?.message,
                    });
                }
            }

            task = {
                status: TaskStatus.COMPLETED,
                metadata: { results: report },
            };
        } catch (error) {
            task = {
                status: TaskStatus.FAILED,
                metadata: { error: (error as Error)?.message },
            };
        }
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

    private async processClasse(classeImportData: ClasseImportModel): Promise<ClasseUpdateReport> {
        const classe = await this.classeGateway.findById(classeImportData.classeId);
        if (!classe) throw new Error("Classe not found");

        const session = await this.sessionGateway.findBySnuId(classeImportData.sessionCode);
        if (!session) throw new Error("Session not found");

        if (session.id !== classe.sessionId) {
            await this.updateYoungCohorts(classe.id, session);
        }

        // const updates = await this.buildClasseUpdates(classeImportData, classe, session);
        // await this.classeGateway.update(updates);

        return { id: classe.id, status: "success" };
    }

    private async updateYoungCohorts(classeId: string, newSession: any): Promise<void> {
        const youngs = await this.jeuneGateway.findByClasseId(classeId);
        for (const young of youngs) {
            await this.jeuneGateway.update({
                ...young,
                sessionId: newSession.id,
                sessionNom: newSession.nom,
                originalSessionId: young.sessionId,
                originalSessionNom: young.sessionNom,
                sessionChangeReason: "Import SI-SNU",
            });
        }
    }

    // private async buildClasseUpdates(
    //     classeImportData: ClasseImportModel,
    //     classe: any,
    //     session: any,
    // ): Promise<ClasseUpdates> {
    //     const updates: ClasseUpdates = {
    //         cohortId: session.id,
    //         cohort: session.nom,
    //         totalSeats: classeImportData.classeTotalSeats,
    //     };

    //     if (classe.statut === STATUS_CLASSE.VERIFIED) {
    //         updates.status = STATUS_CLASSE.ASSIGNED;
    //     }

    //     if (classeImportData.sessionCode) {
    //         const sessionDetails = await this.sessionGateway.findBySnuId(classeImportData.sessionCode);
    //         if (sessionDetails) {
    //             updates.sessionId = sessionDetails.id;
    //             await this.addCenterAndPdrUpdates(updates, classeImportData);
    //         }
    //     }

    //     return updates;
    // }

    // private async addCenterAndPdrUpdates(updates: ClasseUpdates, classeImportData: ClasseImportModel): Promise<void> {
    //     if (classeImportData["Désignation du centre"]) {
    //         const center = await this.centreGateway.findByCode(classeImportData.centerCode);
    //         if (center) {
    //             updates.cohesionCenterId = center.id;

    //             if (classeImportData["Code point de rassemblement initial"]) {
    //                 const pdr = await this.pdrGateway.findByCode(classeImportData.pdrCode);
    //                 if (pdr) {
    //                     updates.pointDeRassemblementId = pdr.id;
    //                     updates.statusPhase1 = STATUS_PHASE1_CLASSE.AFFECTED;
    //                 }
    //             }
    //         }
    //     }
    // }

    // private async updateTaskStatus(taskUpdate: ReferentielImportTaskModel): Promise<void> {
    //     await this.taskGateway.update(taskUpdate.id, {
    //         id: taskUpdate.id,
    //         name: taskUpdate.name,
    //         status: taskUpdate.status,
    //         metadata: taskUpdate.metadata,
    //         createdAt: taskUpdate.createdAt,
    //         updatedAt: new Date(),
    //     });

    //     if (taskUpdate.status === TaskStatus.FAILED) {
    //         throw new Error(taskUpdate.metadata?.results);
    //     }
    // }
}
