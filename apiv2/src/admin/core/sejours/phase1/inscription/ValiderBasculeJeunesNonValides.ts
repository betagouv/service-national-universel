import { Inject, Logger } from "@nestjs/common";

import { MIME_TYPES } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FileGateway } from "@shared/core/File.gateway";

import { ValiderBasculeJeunesNonValidesTaskParameters } from "./ValiderBasculeJeunesNonValides.model";

import { SessionGateway } from "../session/Session.gateway";
import { ValiderBasculeJeunesResult, ValiderBasculeJeunesService } from "./ValiderBasculeJeunes.service";
import { ClockGateway } from "@shared/core/Clock.gateway";

export class ValiderBasculeJeunesNonValides implements UseCase<ValiderBasculeJeunesResult> {
    constructor(
        private readonly validerBasculeJeunesService: ValiderBasculeJeunesService,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        private readonly logger: Logger,
    ) {}

    async execute({
        sessionId,
        simulationTaskId,
        dateValidation,
        sendEmail,
    }: ValiderBasculeJeunesNonValidesTaskParameters): Promise<ValiderBasculeJeunesResult> {
        // Récuperation des données de l'affectation pour la session
        const session = await this.sessionGateway.findById(sessionId);

        // // Récupération des données du rapport de simulation
        const simulationData = await this.validerBasculeJeunesService.getRapportSimulation(simulationTaskId);

        this.logger.debug("Jeunes prochain sejour: " + simulationData.jeunesProchainSejour.length);
        this.logger.debug("Jeunes avenir: " + simulationData.jeunesAvenir.length);

        const { jeunesProchainSejour, jeunesAvenir } =
            await this.validerBasculeJeunesService.getSimulationData(simulationData);

        // update jeunes with transaction
        const { analytics, rapportData } = await this.validerBasculeJeunesService.updateJeunes({
            session,
            simulationData,
            jeunesProchainSejour,
            jeunesAvenir,
        });

        // send emails when transaction is commited
        if (sendEmail) {
            this.validerBasculeJeunesService.notifierJeunes(rapportData);
        }

        // création du fichier excel de rapport
        const fileBuffer = await this.fileGateway.generateExcel({ Volontaires: rapportData });

        // upload du rapport du s3
        const timestamp = this.clockGateway.formatSafeDateTime(dateValidation);
        const fileName = `valider-bascule-jeunes-non-valides/bascule-jeunes-non-valides_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/inscription/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            rapportData,
            rapportFile,
            analytics,
        };
    }
}
