import { Controller, Get, Param, UseGuards } from "@nestjs/common";

import { InscriptionRoutes, TaskName } from "snu-lib";

import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { InscriptionService } from "@admin/core/sejours/phase1/inscription/Inscription.service";

// Les POST de simulation et de validation de la bascule sont supprimés :
// seul le statut (lecture de l'historique des tâches) reste exposé.
@Controller("inscription")
export class BasculeJeuneNonValidesController {
    constructor(private readonly inscriptionService: InscriptionService) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId/bascule-jeunes-non-valides/status")
    async getBaculeJeunesNonValidesStatus(
        @Param("sessionId") sessionId: string,
    ): Promise<InscriptionRoutes["GetBasculeJeunesNonValides"]["response"]> {
        const traitement = await this.inscriptionService.getStatusValidation(
            sessionId,
            TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER,
        );
        return {
            simulation: await this.inscriptionService.getStatusSimulation(
                sessionId,
                TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION,
            ),
            traitement: {
                ...traitement,
                lastCompletedAt: traitement.lastCompletedAt?.toISOString(),
            },
        };
    }
}
