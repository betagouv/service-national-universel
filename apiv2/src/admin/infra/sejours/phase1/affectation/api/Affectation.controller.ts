import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";

import { AffectationRoutes, TaskName } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { SimulationAffectationHTSService } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { SimulationAffectationHTSTaskModel } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSTask.model";
import { Phase1Service, StatusSimulation, StatusValidation } from "@admin/core/sejours/phase1/Phase1.service";

// Les écritures phase 1 (simulations et validations d'affectation, synchronisation des places)
// sont supprimées : ce contrôleur ne sert plus que les lectures de l'historique des tâches.
@Controller("affectation")
export class AffectationController {
    constructor(
        private readonly simulationAffectationHTSService: SimulationAffectationHTSService,
        @Inject(Phase1Service) private readonly phase1Service: Phase1Service,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId/:type")
    async getStatus(
        @Param("sessionId") sessionId: string,
        @Param("type") type: string,
    ): Promise<AffectationRoutes["GetAffectation"]["response"]> {
        let simulation: StatusSimulation;
        let traitement: StatusValidation;
        switch (type) {
            case "HTS":
                simulation = await this.phase1Service.getStatusSimulation(
                    sessionId,
                    TaskName.AFFECTATION_HTS_SIMULATION,
                );
                traitement = await this.phase1Service.getStatusValidation(
                    sessionId,
                    TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
                );
                break;
            case "HTS_DROMCOM":
                simulation = await this.phase1Service.getStatusSimulation(
                    sessionId,
                    TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION,
                );
                traitement = await this.phase1Service.getStatusValidation(
                    sessionId,
                    TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION_VALIDER,
                );
                break;
            case "CLE":
                simulation = await this.phase1Service.getStatusSimulation(
                    sessionId,
                    TaskName.AFFECTATION_CLE_SIMULATION,
                );
                traitement = await this.phase1Service.getStatusValidation(
                    sessionId,
                    TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
                );
                break;
            case "CLE_DROMCOM":
                simulation = await this.phase1Service.getStatusSimulation(
                    sessionId,
                    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION,
                );
                traitement = await this.phase1Service.getStatusValidation(
                    sessionId,
                    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER,
                );
                break;
            default:
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_IMPLEMENTED_YET,
                    "Type d'affectation invalide",
                );
        }

        return {
            simulation,
            traitement: {
                ...traitement,
                lastCompletedAt: traitement.lastCompletedAt?.toISOString(),
            },
        };
    }

    @UseGuards(AdminGuard)
    @Get("/simulation/hts/:id/analytics")
    async getSimulation(
        @Param("id")
        id: string,
    ): Promise<AffectationRoutes["GetSimulationAnalytics"]["response"]> {
        const simulation = (await this.taskGateway.findById(id)) as SimulationAffectationHTSTaskModel;
        if (!simulation.metadata?.results?.rapportKey) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return await this.simulationAffectationHTSService.extractPdfAnalyticsFromRapport(simulation);
    }
}
