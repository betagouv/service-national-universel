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
import { AnnulerClasseDesistee } from "../../../sejours/cle/classe/useCase/AnnulerClasseDesistee";
import { ReferentielImportTaskParameters } from "../../routes/ReferentielImportTask.model";
import { ReferentielClasseMapper } from "../ReferentielClasse.mapper";
import {
    ClasseDesisterModel,
    ClasseDesisterXlsx,
    ClasseImportModel,
    ClasseImportRapport,
    ClasseImportXlsx,
    ClasseRapport,
    DesisterClasseFileValidation,
    ImportClasseFileValidation,
} from "../ReferentielClasse.model";
import { Transactional } from "@nestjs-cls/transactional";
import { DesistementService } from "@admin/core/sejours/phase1/desistement/Desistement.service";

@Injectable()
export class ImporterClasses implements UseCase<ClasseRapport[]> {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(CentreGateway) private readonly centreGateway: CentreGateway,
        @Inject(PointDeRassemblementGateway) private readonly pdrGateway: PointDeRassemblementGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        @Inject(AnnulerClasseDesistee) private readonly annulerClasseDesistee: AnnulerClasseDesistee,
        @Inject(DesistementService) private readonly desistementService: DesistementService,
        private readonly logger: Logger,
    ) {}

    async execute(parameters: ReferentielImportTaskParameters): Promise<ClasseRapport[]> {
        const report: ClasseImportRapport[] = [];
        const fileContent = await this.fileGateway.downloadFile(parameters.fileKey);
        const classesFromXslx = await this.fileGateway.parseXLS<ClasseImportXlsx>(fileContent.Body, {
            sheetName: ImportClasseFileValidation.sheetName,
        });
        const mappedClasses = ReferentielClasseMapper.mapImporterClassesFromFile(classesFromXslx);

        const classesDesisteesFromXslx = await this.fileGateway.parseXLS<ClasseDesisterXlsx>(fileContent.Body, {
            sheetName: DesisterClasseFileValidation.sheetName,
        });
        const mappedClassesDesistees = ReferentielClasseMapper.mapDesisterClassesFromFile(classesDesisteesFromXslx);

        for (const mappedClasse of mappedClasses) {
            try {
                const result = await this.processClasse(mappedClasse, mappedClassesDesistees);
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
        return report;
    }

    @Transactional()
    private async processClasse(
        classeImport: ClasseImportModel,
        classesDesistees: ClasseDesisterModel[],
    ): Promise<ClasseImportRapport> {
        let classe = await this.classeGateway.findById(classeImport.classeId);
        if (!classe) {
            throw new Error("Classe non trouvée en base");
        }
        let classeRapport: ClasseImportRapport = {
            classeId: classe.id,
            sessionCode: classeImport.sessionCode,
            cohortCode: classeImport.cohortCode,
        };
        // Vérification de si la classe existe dans l'onglet desistement
        if (classesDesistees.find((classeDesistee) => classeDesistee.classeId === classe.id)) {
            return {
                ...classeRapport,
                error: "Classe existe dans les 2 onglets",
            };
        }

        const updatedFields: string[] = [];

        // Si la classe est désistée => annuler le désistement de la classe
        if (classe.statut === STATUS_CLASSE.WITHDRAWN) {
            const annulerClasseDesistee = await this.annulerClasseDesistee.execute(classe);
            classeRapport = {
                ...classeRapport,
                annulerClasseDesisteeId: classe.id,
                annulerClasseDesisteeRapport: annulerClasseDesistee.rapport,
            };
            classe = annulerClasseDesistee.classe;
            updatedFields.push("statut");
        }

        const session = await this.sessionGateway.findBySnuId(classeImport.cohortCode);
        if (!session) {
            throw new Error("Session non trouvée en base");
        }

        if (session.id !== classe.sessionId) {
            await this.updateYoungCohorts(classe.id, session);
            await this.resetAffectation(classe);
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
                ...classeRapport,
                sessionId: session.id,
                sessionName: session.nom,
                classeStatus: updatedClasse.statut,
                classeTotalSeats: updatedClasse.placesTotal,
                updated: updatedFields.join(", "),
                error: errorMessage,
                result: "error",
            };
        }

        newClasseData.sejourId = sejour.id;
        updatedFields.push(...(await this.addCenterAndPdrUpdates(newClasseData, classeImport)));

        const updatedClasse = await this.classeGateway.update({ ...classe, ...newClasseData });
        return {
            ...classeRapport,
            sessionId: session.id,
            sessionName: session.nom,
            classeStatus: updatedClasse.statut,
            classeTotalSeats: updatedClasse.placesTotal,
            updated: updatedFields.join(", "),
            result: "success",
        };
    }

    private async updateYoungCohorts(classeId: string, newSession: any): Promise<void> {
        // Récupérer la classe depuis la base de données pour obtenir son cohortId
        const classe = await this.classeGateway.findById(classeId);

        if (!classe) {
            this.logger.error(`Classe introuvable en base de données : ${classeId}`, ImporterClasses.name);
            return;
        }

        // Récupérer les jeunes de la classe
        const jeunes = await this.jeuneGateway.findByClasseIdAndSessionId(classeId, classe.sessionId!);

        const jeunesUpdatedList: JeuneModel[] = jeunes.map((jeune) => {
            const jeuneWithNewSession = {
                ...jeune,
                sessionId: newSession.id,
                sessionNom: newSession.nom,
                originalSessionId: jeune.sessionId,
                originalSessionNom: jeune.sessionNom,
                sessionChangeReason: "Import SI-SNU",
                statutPhase1: jeune.statutPhase1 === "AFFECTED" ? "WAITING_AFFECTATION" : jeune.statutPhase1,
                youngPhase1Agreement: "false",
            };

            // reset des informations d'affectation
            return this.desistementService.resetInfoAffectation(jeuneWithNewSession);
        });

        await this.jeuneGateway.bulkUpdate(jeunesUpdatedList);
        this.logger.log(
            `Updated ${jeunesUpdatedList.length} jeunes with new session ${newSession.nom}`,
            ImporterClasses.name,
        );
    }

    private async resetAffectation(classe: ClasseModel): Promise<void> {
        classe.pointDeRassemblementId = undefined;
        classe.centreCohesionId = undefined;
        classe.ligneId = undefined;
        classe.statutPhase1 = STATUS_PHASE1_CLASSE.WAITING_AFFECTATION;

        await this.classeGateway.update(classe);
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
