import { Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { MIME_TYPES } from "snu-lib";
import { TaskGateway } from "@task/core/Task.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { RapportData } from "./SimulationDesisterPostAffectationTask.model";

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
        const affectationTask = await this.taskGateway.findById(affectationTaskId);
        if (!affectationTask) {
            throw new Error("Affectation task not found");
        }
        const ids = await this.desistementService.getJeunesIdsFromRapportKey(
            affectationTask.metadata?.results.rapportKey,
        );
        const jeunes = await this.jeuneGateway.findByIds(ids);
        this.logger.log("desistement post affectation nb jeunes", jeunes.length);

        const groups = this.desistementService.groupJeunesByReponseAuxAffectations(jeunes, sessionId);

        const rapportData = Object.entries(groups).reduce(
            (acc, [key, jeunes]) => {
                acc[key] = this.desistementService.mapJeunes(jeunes);
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
        const fileBuffer = await this.desistementService.generateRapportPostDesistement(rapportData);
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
}
