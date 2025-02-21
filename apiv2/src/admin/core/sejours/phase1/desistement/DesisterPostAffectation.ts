import { Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { DesisterTaskResult } from "snu-lib";

export class DesisterPostAffectation implements UseCase<DesisterTaskResult> {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        private readonly desistementService: DesistementService,
        private readonly logger: Logger,
    ) {}

    async preview({
        sessionId,
        affectationTaskId,
    }: {
        sessionId: string;
        affectationTaskId: string;
    }): Promise<DesisterTaskResult> {
        const ids = await this.desistementService.getJeunesIdsFromTask(affectationTaskId);
        const jeunes = await this.jeuneGateway.findByIds(ids);
        const { jeunesAutreSession, jeunesConfirmes, jeunesDesistes, jeunesNonConfirmes } =
            this.desistementService.groupJeunesByCategories(jeunes, sessionId);
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
        const ids = await this.desistementService.getJeunesIdsFromTask(affectationTaskId);
        const jeunes = await this.jeuneGateway.findByIds(ids);
        const { jeunesAutreSession, jeunesConfirmes, jeunesDesistes, jeunesNonConfirmes } =
            this.desistementService.groupJeunesByCategories(jeunes, sessionId);
        // const jeunesModifies = await this.desistementService.desisterJeunes(jeunesNonConfirmes);
        this.logger.debug(`DesistementService: ${jeunesNonConfirmes.length} jeunes désistés`);
        // TODO: Rapport
        await this.desistementService.notifierJeunes(jeunesNonConfirmes);
        return {
            jeunesDesistes: jeunesDesistes.length,
            jeunesAutreSession: jeunesAutreSession.length,
            jeunesConfirmes: jeunesConfirmes.length,
            jeunesNonConfirmes: jeunesNonConfirmes.length,
            // jeunesModifies,
            rapportKey: "",
        };
    }
}
