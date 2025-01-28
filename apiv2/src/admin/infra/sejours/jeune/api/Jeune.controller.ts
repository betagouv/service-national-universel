import { Controller, Put, Param, UseGuards, Body } from "@nestjs/common";
import { YOUNG_SOURCE } from "snu-lib";

import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { BasculeCLEtoCLE } from "@admin/core/sejours/jeune/useCase/basculeCLEtoCLE/basculeCLEtoCLE";
import { BasculeCLEtoHTS } from "@admin/core/sejours/jeune/useCase/basculeCLEtoHTS/basculeCLEtoHTS";
import { BasculeHTStoCLE } from "@admin/core/sejours/jeune/useCase/basculeHTStoCLE/basculeHTStoCLE";
import { BasculeHTStoHTS } from "@admin/core/sejours/jeune/useCase/basculeHTStoHTS/basculeHTStoHTS";

import { JeuneReferentGuard } from "../guard/JeuneReferent.guard";
import { ChangerLaCohorteDuJeunePayloadDto } from "./Jeune.validation";

@Controller("Jeune")
export class JeuneController {
    constructor(
        private readonly basculeCLEtoCLE: BasculeCLEtoCLE,
        private readonly basculeCLEtoHTS: BasculeCLEtoHTS,
        private readonly basculeHTStoCLE: BasculeHTStoCLE,
        private readonly basculeHTStoHTS: BasculeHTStoHTS,
        private readonly jeuneGateway: JeuneGateway,
    ) {}

    @Put(":id/change-cohort")
    @UseGuards(JeuneReferentGuard)
    async changeCohort(
        @Param("id") id: string,
        @Body() changerLaCohorteDuJeune: ChangerLaCohorteDuJeunePayloadDto,
    ): Promise<JeuneModel> {
        const jeune = await this.jeuneGateway.findById(id);

        const transitions = {
            [`${YOUNG_SOURCE.CLE}-${YOUNG_SOURCE.CLE}`]: () =>
                this.basculeCLEtoCLE.execute(id, changerLaCohorteDuJeune),
            [`${YOUNG_SOURCE.CLE}-${YOUNG_SOURCE.VOLONTAIRE}`]: () =>
                this.basculeCLEtoHTS.execute(id, changerLaCohorteDuJeune),
            [`${YOUNG_SOURCE.VOLONTAIRE}-${YOUNG_SOURCE.CLE}`]: () =>
                this.basculeHTStoCLE.execute(id, changerLaCohorteDuJeune),
            [`${YOUNG_SOURCE.VOLONTAIRE}-${YOUNG_SOURCE.VOLONTAIRE}`]: () =>
                this.basculeHTStoHTS.execute(id, changerLaCohorteDuJeune),
        };

        const transitionKey = `${jeune.source}-${changerLaCohorteDuJeune.source}`;
        const executeTransition = transitions[transitionKey];

        if (executeTransition) {
            return executeTransition();
        }

        return jeune;
    }
}
