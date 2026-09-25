import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { TaskName, DesistementRoutes } from "snu-lib";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { Phase1Service, StatusSimulation, StatusValidation } from "@admin/core/sejours/phase1/Phase1.service";
import { GetDesistementParamsDto } from "./Desistement.validation";

// POST /:sessionId/simulation et POST /:sessionId/simulation/:taskId/valider sont supprimées :
// seul le statut (lecture de l'historique des tâches) reste exposé.
@Controller("desistement")
export class DesistementController {
    constructor(@Inject(Phase1Service) private readonly phase1Service: Phase1Service) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId")
    async getStatus(
        @Param() { sessionId }: GetDesistementParamsDto,
    ): Promise<DesistementRoutes["GetDesistement"]["response"]> {
        let simulation: StatusSimulation;
        let traitement: StatusValidation;

        simulation = await this.phase1Service.getStatusSimulation(
            sessionId,
            TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION,
        );
        traitement = await this.phase1Service.getStatusValidation(
            sessionId,
            TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER,
        );

        return {
            simulation,
            traitement: {
                ...traitement,
                lastCompletedAt: traitement.lastCompletedAt?.toISOString(),
            },
        };
    }
}
