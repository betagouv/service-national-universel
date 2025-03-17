import { Inject, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

import { UseCase } from "@shared/core/UseCase";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { DesisterValiderTaskResult, MIME_TYPES } from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
import {
    RAPPORT_SHEETS_SIMULATION,
    JeuneTraitementDesistementRapport,
    RapportData,
    SimulationDesisterPostAffectationTaskModel,
} from "./SimulationDesisterPostAffectationTask.model";
import { RAPPORT_SHEETS_TRAITEMENT } from "./ValiderDesisterPostAffectationTask.model";
import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FileGateway } from "@shared/core/File.gateway";
import { JeuneModel } from "../../jeune/Jeune.model";

export class ValiderDesisterPostAffectation implements UseCase<DesisterValiderTaskResult> {
    constructor(
        private readonly desistementService: DesistementService,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        private readonly cls: ClsService,
        private readonly logger: Logger,
    ) {}

    async execute({
        sessionId,
        simulationTaskId,
    }: {
        sessionId: string;
        simulationTaskId: string;
    }): Promise<DesisterValiderTaskResult> {
        const simulationData = await this.getRapportSimulation(simulationTaskId);

        this.logger.debug("Jeunes à desister: " + simulationData.jeunesADesister.length);

        const ids = simulationData.jeunesADesister.map((jeune) => jeune.id);
        const jeunes = await this.jeuneGateway.findByIds(ids);

        const { jeunesNonConfirmes, jeunesConfirmes, jeunesAutreSession, jeunesDesistes } =
            this.desistementService.groupJeunesByReponseAuxAffectations(jeunes, sessionId);
        const jeunesModifies = await this.desistementService.desisterJeunes(jeunesNonConfirmes, sessionId);

        if (jeunesModifies !== jeunesNonConfirmes.length) {
            throw new FunctionalException(
                FunctionalExceptionCode.RESULT_DIFFERENT_THAN_SIMULATION,
                "Nombre de jeunes désistés différent de la simulation",
            );
        }

        const rapportData = {
            jeunesNonConfirmes: this.mapJeunesTraitement(jeunesNonConfirmes),
            jeunesConfirmes: this.mapJeunesTraitement(jeunesConfirmes),
            jeunesAutreSession: this.mapJeunesTraitement(jeunesAutreSession),
            jeunesDesistes: this.mapJeunesTraitement(jeunesDesistes),
        } as RapportData;

        this.cls.set("user", { firstName: "Traitement - Désistement après affectation" });

        this.cls.set("user", null);
        this.logger.debug(`DesistementService: ${rapportData.jeunesNonConfirmes.length} jeunes désistés`);

        // création du fichier excel de rapport
        const fileBuffer = await this.generateRapportTraitementPostDesistement(rapportData);
        const timestamp = this.clockGateway.formatSafeDateTime(this.clockGateway.now({ timeZone: "Europe/Paris" }));
        const fileName = `desistement/desistement-post-affectation_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        await this.desistementService.notifierJeunes(rapportData.jeunesNonConfirmes);
        return {
            jeunesDesistes: rapportData.jeunesDesistes.length,
            jeunesAutreSession: rapportData.jeunesAutreSession.length,
            jeunesConfirmes: rapportData.jeunesConfirmes.length,
            jeunesNonConfirmes: rapportData.jeunesNonConfirmes.length,
            jeunesModifies,
            rapportKey: `file/admin/sejours/phase1/affectation/${sessionId}/${fileName}`,
        };
    }

    async getRapportSimulation(taskId: string) {
        const simulationTask: SimulationDesisterPostAffectationTaskModel = await this.taskGateway.findById(taskId);
        const rapportKey = simulationTask.metadata?.results?.rapportKey;

        if (!rapportKey) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Fichier associé à la simulation introuvable",
            );
        }
        const importedFile = await this.fileGateway.downloadFile(rapportKey);
        const jeunesADesister = await this.fileGateway.parseXLS<RapportData["jeunesNonConfirmes"][0]>(
            importedFile.Body,
            {
                sheetName: RAPPORT_SHEETS_SIMULATION.A_DESITER,
            },
        );

        return {
            jeunesADesister,
        };
    }

    mapJeunesTraitement(jeunes: JeuneModel[]): JeuneTraitementDesistementRapport[] {
        return jeunes.map((jeune) => ({
            sejour: jeune.sessionNom,
            id: jeune.id,
            prenom: jeune.prenom,
            nom: jeune.nom,
            email: jeune.email,
            sexe: jeune.genre,
            departement: jeune.departement,
            region: jeune.region,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            sessionId: jeune.sessionId,
            "centre d'affectation": jeune.centreId,
            "PDR d'affectation": jeune.pointDeRassemblementId,
            Ligne: jeune.ligneDeBusId,
            "RL1 Nom": jeune.parent1Nom,
            "RL1 Prénom": jeune.parent1Prenom,
            "RL1 Email": jeune.parent1Email,
            "RL2 Nom": jeune.parent2Nom || "",
            "RL2 Prénom": jeune.parent2Prenom || "",
            "RL2 Email": jeune.parent2Email || "",
            youngPhase1Agreement: jeune.youngPhase1Agreement,
        }));
    }

    async generateRapportTraitementPostDesistement(rapportData: RapportData): Promise<Buffer> {
        const fileBuffer = await this.fileGateway.generateExcel({
            [RAPPORT_SHEETS_TRAITEMENT.RESUME]: [
                {
                    Groupe: "Total de volontaires affectés",
                    Total:
                        rapportData.jeunesDesistes.length +
                        rapportData.jeunesAutreSession.length +
                        rapportData.jeunesConfirmes.length +
                        rapportData.jeunesNonConfirmes.length,
                },
                {
                    Groupe: "Volontaires désistés au préalable",
                    Total: rapportData.jeunesDesistes.length,
                },
                {
                    Groupe: "Volontaires ayant changé de séjour",
                    Total: rapportData.jeunesAutreSession.length,
                },
                {
                    Groupe: "Volontaires ayant confirmés leur séjour",
                    Total: rapportData.jeunesConfirmes.length,
                },
                {
                    Groupe: "Volontaires désistés par ce traitement",
                    Total: rapportData.jeunesNonConfirmes.length,
                },
            ],
            [RAPPORT_SHEETS_TRAITEMENT.DESISTES]: rapportData.jeunesNonConfirmes,
            [RAPPORT_SHEETS_TRAITEMENT.CONFIRMATION_PARTICIPATION]: rapportData.jeunesConfirmes,
            [RAPPORT_SHEETS_TRAITEMENT.CHANGEMENTS_SEJOUR]: rapportData.jeunesAutreSession,
            [RAPPORT_SHEETS_TRAITEMENT.DESITEMENT_PREALABLE]: rapportData.jeunesDesistes,
        });
        return fileBuffer;
    }
}
