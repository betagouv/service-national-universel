import { Controller, Param, Post } from "@nestjs/common";
import { SimulationAffectationHTS } from "src/admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import { SimulationAffectationHTSService } from "src/admin/core/sejours/phase1/affectation/SimulationAffectationHTS.service";

@Controller("affectation")
export class AffectationController {
    constructor(
        private readonly simulationAffectationHts: SimulationAffectationHTS,
        private readonly simulationAffectationHTSService: SimulationAffectationHTSService,
    ) {}

    // FIXME: add guard
    @Post("/:sessionId")
    async simulate(@Param("sessionId") sessionId: string): Promise<void> {
        // TODO: faire le traitement dans un job asynchrone (actuellement sync temporaire pour test)
        const simulation = await this.simulationAffectationHts.execute({ sessionId });
        this.simulationAffectationHTSService.saveExcelFile(
            simulation.rapportData,
            `affectation_simulation_${sessionId}_${new Date().toISOString()}.xlsx`,
        );
        // this.simulationAffectationHTSService.savePdfFile(
        //     simulation,
        //     `affectation_simulation_${sessionId}_${new Date().toISOString()}.pdf`,
        // );
    }
}
