import { Controller, Put, Param, UseGuards, Body, Inject, Request } from "@nestjs/common";
import { YOUNG_SOURCE, Phase1Routes } from "snu-lib";

import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { BasculeCLEtoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeCLEtoCLE";
import { BasculeHTStoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeHTStoCLE";

import { JeuneReferentGuard } from "../../../jeune/guard/JeuneReferent.guard";
import { ChangerLaSessionDuJeunePayloadDto } from "./Bascule.validation";
import { CustomRequest } from "@shared/infra/CustomRequest";

@Controller("Bascule")
export class BasculeController {
    constructor(
        private readonly basculeCLEtoCLE: BasculeCLEtoCLE,
        private readonly basculeHTStoCLE: BasculeHTStoCLE,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
    ) {}

    @Put(":id/change-session")
    @UseGuards(JeuneReferentGuard)
    async changeCohort(
        @Param("id") id: string,
        @Body() changerLaSessionDuJeune: ChangerLaSessionDuJeunePayloadDto,
        @Request() request: CustomRequest,
    ): Promise<Phase1Routes["ChangeYoungSessionRoute"]["response"]> {
        const user = request.user;
        const jeune = await this.jeuneGateway.findById(id);

        if (jeune.source === YOUNG_SOURCE.CLE && changerLaSessionDuJeune.source === YOUNG_SOURCE.CLE) {
            return this.basculeCLEtoCLE.execute(id, changerLaSessionDuJeune, user);
        } else if (jeune.source === YOUNG_SOURCE.VOLONTAIRE && changerLaSessionDuJeune.source === YOUNG_SOURCE.CLE) {
            return this.basculeHTStoCLE.execute(id, changerLaSessionDuJeune, user);
        } else {
            throw new Error("Unhandled source combination");
        }
    }
}
