import { Controller, Put, Param, UseGuards, Body, Inject } from "@nestjs/common";
import { YOUNG_SOURCE, Phase1Routes } from "snu-lib";

import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { BasculeCLEtoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeCLEtoCLE";
import { BasculeCLEtoHTS } from "@admin/core/sejours/phase1/bascule/useCase/BasculeCLEtoHTS";
import { BasculeHTStoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeHTStoCLE";
import { BasculeHTStoHTS } from "@admin/core/sejours/phase1/bascule/useCase/BasculeHTStoHTS";

import { JeuneReferentGuard } from "../../../jeune/guard/JeuneReferent.guard";
import { ChangerLaSessionDuJeunePayloadDto } from "./Bascule.validation";

@Controller("Bascule")
export class BasculeController {
    constructor(
        private readonly basculeCLEtoCLE: BasculeCLEtoCLE,
        private readonly basculeCLEtoHTS: BasculeCLEtoHTS,
        private readonly basculeHTStoCLE: BasculeHTStoCLE,
        private readonly basculeHTStoHTS: BasculeHTStoHTS,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
    ) {}

    @Put(":id/change-session")
    @UseGuards(JeuneReferentGuard)
    async changeCohort(
        @Param("id") id: string,
        @Body() changerLaSessionDuJeune: ChangerLaSessionDuJeunePayloadDto,
    ): Promise<Phase1Routes["ChangeYoungSessionRoute"]["response"]> {
        const jeune = await this.jeuneGateway.findById(id);

        if (jeune.source === YOUNG_SOURCE.CLE && changerLaSessionDuJeune.source === YOUNG_SOURCE.CLE) {
            return this.basculeCLEtoCLE.execute(id, changerLaSessionDuJeune);
        } else if (jeune.source === YOUNG_SOURCE.CLE && changerLaSessionDuJeune.source === YOUNG_SOURCE.VOLONTAIRE) {
            return this.basculeCLEtoHTS.execute(id, changerLaSessionDuJeune);
        } else if (jeune.source === YOUNG_SOURCE.VOLONTAIRE && changerLaSessionDuJeune.source === YOUNG_SOURCE.CLE) {
            return this.basculeHTStoCLE.execute(id, changerLaSessionDuJeune);
        } else if (
            jeune.source === YOUNG_SOURCE.VOLONTAIRE &&
            changerLaSessionDuJeune.source === YOUNG_SOURCE.VOLONTAIRE
        ) {
            return this.basculeHTStoHTS.execute(id, changerLaSessionDuJeune);
        } else {
            throw new Error("Unhandled source combination");
        }
    }
}
