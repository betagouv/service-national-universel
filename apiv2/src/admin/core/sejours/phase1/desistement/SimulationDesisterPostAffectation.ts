import { Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { MIME_TYPES } from "snu-lib";
import { TaskGateway } from "@task/core/Task.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import {
    JeuneSimulationDesistementRapport,
    RapportData,
    RAPPORT_SHEETS_SIMULATION,
} from "./SimulationDesisterPostAffectationTask.model";
import { ValiderAffectationHTSDromComTaskModel } from "../affectation/ValiderAffectationHTSDromComTask.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { JeuneModel } from "../../jeune/Jeune.model";

export type SimulationDesistementResult = {
    rapportData: RapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: {
        jeunesNonConfirmes: number;
        jeunesConfirmes: number;
        jeunesAutreSession: number;
        jeunesDesistes: number;
    };
};

export class SimulationDesisterPostAffectation implements UseCase<SimulationDesistementResult> {
    constructor(
        private readonly desistementService: DesistementService,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        private readonly logger: Logger,
    ) {}

    async execute({
        sessionId,
        affectationTaskId,
    }: {
        sessionId: string;
        affectationTaskId: string;
    }): Promise<SimulationDesistementResult> {
        const affectationTask: ValiderAffectationHTSDromComTaskModel =
            await this.taskGateway.findById(affectationTaskId);
        if (!affectationTask.metadata?.results?.rapportKey) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Fichier associé à l'affectation introuvable",
            );
        }
        const ids = await this.desistementService.getJeunesIdsFromRapportKey(
            affectationTask.metadata.results.rapportKey,
        );
        const jeunes = await this.jeuneGateway.findByIds(ids);
        this.logger.log("desistement post affectation nb jeunes", jeunes.length);

        const groups = this.desistementService.groupJeunesByReponseAuxAffectations(jeunes, sessionId);

        const rapportData = Object.entries(groups).reduce(
            (acc, [key, jeunes]) => {
                acc[key] = this.mapJeunesSimulation(jeunes);
                return acc;
            },
            {
                jeunesNonConfirmes: [],
                jeunesConfirmes: [],
                jeunesAutreSession: [],
                jeunesDesistes: [],
            } as RapportData,
        );

        // création du fichier excel de rapport
        const fileBuffer = await this.generateRapportSimulationPostDesistement(rapportData);
        const timestamp = this.clockGateway.formatSafeDateTime(this.clockGateway.now({ timeZone: "Europe/Paris" }));
        const fileName = `simulation-desistement/desistement-simulation-post-affectation_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            analytics: {
                jeunesNonConfirmes: rapportData.jeunesNonConfirmes.length,
                jeunesConfirmes: rapportData.jeunesConfirmes.length,
                jeunesAutreSession: rapportData.jeunesAutreSession.length,
                jeunesDesistes: rapportData.jeunesDesistes.length,
            },
            rapportData,
            rapportFile,
        };
    }

    mapJeunesSimulation(jeunes: JeuneModel[]): JeuneSimulationDesistementRapport[] {
        return jeunes.map((jeune) => ({
            id: jeune.id,
            email: jeune.email,
            prenom: jeune.prenom,
            nom: jeune.nom,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            sejour: jeune.sessionNom,
            region: jeune.region,
            departement: jeune.departement,
            sessionId: jeune.sessionId,
            youngPhase1Agreement: jeune.youngPhase1Agreement,
        }));
    }

    async generateRapportSimulationPostDesistement(rapportData: RapportData): Promise<Buffer> {
        const fileBuffer = await this.fileGateway.generateExcel({
            [RAPPORT_SHEETS_SIMULATION.RESUME]: [
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
            [RAPPORT_SHEETS_SIMULATION.A_DESITER]: rapportData.jeunesNonConfirmes,
            [RAPPORT_SHEETS_SIMULATION.CONFIRMATION_PARTICIPATION]: rapportData.jeunesConfirmes,
            [RAPPORT_SHEETS_SIMULATION.CHANGEMENTS_SEJOUR]: rapportData.jeunesAutreSession,
            [RAPPORT_SHEETS_SIMULATION.DESITEMENT_PREALABLE]: rapportData.jeunesDesistes,
        });
        return fileBuffer;
    }
}
