import { Body, Controller, Get, Inject, Param, Post, Res, StreamableFile, UseGuards } from "@nestjs/common";
import { department2region, departmentList, GRADES, RegionsHorsMetropole, TaskName, TaskStatus } from "snu-lib";
import { SimulationAffectationHTS } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import { SimulationAffectationHTSService } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { TaskGateway } from "@task/core/Task.gateway";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";

// TODO: add validation, move dto to a separate file
export class SimulateDto {
    departements: string[];
    niveauScolaires: Array<keyof typeof GRADES>;
    changementDepartements: { origine: string; destination: string }[];
}

@Controller("affectation")
export class AffectationController {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly simulationAffectationHts: SimulationAffectationHTS,
        private readonly simulationAffectationHTSService: SimulationAffectationHTSService,
    ) {}

    @UseGuards(AdminGuard)
    @Post("/:sessionId")
    async simulate(
        @Param("sessionId") sessionId: string,
        @Body() simulateDto: SimulateDto,
        @Res({ passthrough: true }) response,
    ): Promise<StreamableFile> {
        this.taskGateway.create({
            name: TaskName.AFFECTATION_HTS_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                sessionId,
                departements:
                    simulateDto.departements ||
                    departmentList.filter(
                        (departement) => !RegionsHorsMetropole.includes(department2region[departement]),
                    ),
                niveauScolaires: simulateDto.niveauScolaires || Object.values(GRADES),
                changementDepartements: simulateDto.changementDepartements || [],
            },
        });
        // TODO: supprimer le traitement synchrone de test
        const simulation = await this.simulationAffectationHts.execute({
            sessionId,
            departements:
                simulateDto.departements ||
                departmentList.filter((departement) => !RegionsHorsMetropole.includes(department2region[departement])),
            niveauScolaires: simulateDto.niveauScolaires || Object.values(GRADES),
            changementDepartements: simulateDto.changementDepartements || [],
        });

        const fileName = `affectation_simulation_${sessionId}_${new Date().toISOString()}.xlsx`;
        const fileBuffer = await this.simulationAffectationHTSService.generateRapportExcel(simulation.rapportData);

        response.setHeader("Content-Type", `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`);
        response.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        return new StreamableFile(fileBuffer);
    }

    @UseGuards(AdminGuard)
    @Get("/:sessionId/simulations")
    async getSimulations(@Param("sessionId") sessionId: string): Promise<any> {
        // TODO: filtrer par sessionId
        const simulations = await this.taskGateway.findByName(TaskName.AFFECTATION_HTS_SIMULATION);

        return simulations.filter((simulation) => simulation.metadata.sessionId === sessionId);
    }
}
