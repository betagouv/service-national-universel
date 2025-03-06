import { Inject, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { DesistementService } from "./Desistement.service";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { DesisterTaskResult } from "snu-lib";
import { JeuneService } from "../../jeune/Jeune.service";
import { JeuneModel } from "../../jeune/Jeune.model";

export class DesisterPostAffectation implements UseCase<DesisterTaskResult> {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        private readonly jeuneService: JeuneService,
        private readonly desistementService: DesistementService,
        private readonly logger: Logger,
    ) {}

    async execute({ sessionId, rapportKey }: { sessionId: string; rapportKey: string }): Promise<DesisterTaskResult> {
        const ids = await this.desistementService.getJeunesIdsFromRapportKey(rapportKey);
        const jeunes = await this.jeuneGateway.findByIds(ids);
        const { jeunesAutreSession, jeunesConfirmes, jeunesDesistes, jeunesNonConfirmes } =
            this.jeuneService.groupJeunesByReponseAuxAffectations(jeunes, sessionId);
        const jeunesModifies = await this.desistementService.desisterJeunes(jeunesNonConfirmes, sessionId);
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
}
