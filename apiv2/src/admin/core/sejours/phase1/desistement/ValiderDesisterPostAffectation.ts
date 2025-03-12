import { Inject, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

import { UseCase } from "@shared/core/UseCase";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { DesisterValiderTaskResult } from "snu-lib";

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

        const { jeunesAutreSession, jeunesConfirmes, jeunesDesistes, jeunesNonConfirmes } =
            this.desistementService.groupJeunesByReponseAuxAffectations(jeunes, sessionId);

        this.cls.set("user", { firstName: "Traitement - Désistement après affectation" });

        const jeunesModifies = await this.desistementService.desisterJeunes(jeunesNonConfirmes, sessionId);

        this.cls.set("user", null);
        this.logger.debug(`DesistementService: ${jeunesNonConfirmes.length} jeunes désistés`);

        // TODO: Rapport

        await this.desistementService.notifierJeunes(jeunesNonConfirmes);
        return {
            jeunesDesistes: jeunesDesistes.length,
            jeunesAutreSession: jeunesAutreSession.length,
            jeunesConfirmes: jeunesConfirmes.length,
            jeunesNonConfirmes: jeunesNonConfirmes.length,
            jeunesModifies,
            rapportKey: "",
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
