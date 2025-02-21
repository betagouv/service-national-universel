import { Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { DesisterTaskResult } from "snu-lib";

export class DesisterPostAffectation implements UseCase<DesisterTaskResult> {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        private readonly DesistementService: DesistementService,
        private readonly logger: Logger,
    ) {}

    async preview({
        sessionId,
        affectationTaskId,
    }: {
        sessionId: string;
        affectationTaskId: string;
    }): Promise<DesisterTaskResult> {
        const ids = await this.DesistementService.getJeunesIdsFromTask(affectationTaskId);
        const jeunes = await this.jeuneGateway.findByIds(ids);
        const { jeunesAutreSession, jeunesConfirmes, jeunesDesistes, jeunesNonConfirmes } =
            this.DesistementService.groupJeunesByCategories(jeunes, sessionId);
        return {
            jeunesDesistes: jeunesDesistes.length,
            jeunesAutreSession: jeunesAutreSession.length,
            jeunesConfirmes: jeunesConfirmes.length,
            jeunesNonConfirmes: jeunesNonConfirmes.length,
        };
    }

    async execute({
        sessionId,
        affectationTaskId,
    }: {
        sessionId: string;
        affectationTaskId: string;
    }): Promise<DesisterTaskResult> {
        const ids = await this.DesistementService.getJeunesIdsFromTask(affectationTaskId);
        const jeunes = await this.jeuneGateway.findByIds(ids);
        const { jeunesAutreSession, jeunesConfirmes, jeunesDesistes, jeunesNonConfirmes } =
            this.DesistementService.groupJeunesByCategories(jeunes, sessionId);
        const jeunesModifies = await this.DesistementService.desisterJeunes(jeunesNonConfirmes);
        this.logger.debug(`DesistementService: ${jeunesModifies} jeunes désistés`);
        // TODO: Rapport
        // TODO: Notification
        return {
            jeunesDesistes: jeunesDesistes.length,
            jeunesAutreSession: jeunesAutreSession.length,
            jeunesConfirmes: jeunesConfirmes.length,
            jeunesNonConfirmes: jeunesNonConfirmes.length,
            jeunesModifies,
            rapportKey: "",
        };
    }
}
