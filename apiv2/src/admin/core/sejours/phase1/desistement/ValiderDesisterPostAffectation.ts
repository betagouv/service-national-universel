import { Inject, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

import { UseCase } from "@shared/core/UseCase";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { DesisterValiderTaskResult, MIME_TYPES } from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
import {
    RAPPORT_SHEETS,
    RapportData,
    SimulationDesisterPostAffectationTaskModel,
} from "./SimulationDesisterPostAffectationTask.model";
import { TaskGateway } from "@task/core/Task.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FileGateway } from "@shared/core/File.gateway";

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
        desistementTaskId,
    }: {
        sessionId: string;
        desistementTaskId: string;
    }): Promise<DesisterValiderTaskResult> {
        const simulationData = await this.getRapportSimulation(desistementTaskId);

        this.logger.debug("Jeunes à desister: " + simulationData.jeunesADesister.length);

        const ids = simulationData.jeunesADesister.map((jeune) => jeune.id);
        const jeunes = await this.jeuneGateway.findByIds(ids);

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

        this.cls.set("user", { firstName: "Traitement - Désistement après affectation" });

        const jeunesModifies = await this.desistementService.desisterJeunes(rapportData.jeunesNonConfirmes, sessionId);

        this.cls.set("user", null);
        this.logger.debug(`DesistementService: ${rapportData.jeunesNonConfirmes.length} jeunes désistés`);

        // création du fichier excel de rapport
        const fileBuffer = await this.desistementService.generateRapportPostDesistement(rapportData);
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
                sheetName: RAPPORT_SHEETS.A_DESITER,
            },
        );

        return {
            jeunesADesister,
        };
    }
}
