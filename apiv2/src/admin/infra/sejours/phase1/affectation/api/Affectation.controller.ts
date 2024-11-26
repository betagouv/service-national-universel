import { Body, Controller, Get, Inject, Param, Post, Res, StreamableFile, UseGuards } from "@nestjs/common";

import { department2region, departmentList, GRADES, RegionsHorsMetropole, TaskName, TaskStatus } from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { TaskModel } from "@task/core/Task.model";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";

// TODO: add validation, move dto to a separate file
export class SimulateDto {
    departements: string[];
    niveauScolaires: Array<keyof typeof GRADES>;
    changementDepartements: { origine: string; destination: string }[];
}

@Controller("affectation")
export class AffectationController {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    @UseGuards(AdminGuard)
    @Post("/:sessionId")
    async simulate(@Param("sessionId") sessionId: string, @Body() simulateDto: SimulateDto): Promise<TaskModel> {
        const task = this.taskGateway.create({
            name: TaskName.AFFECTATION_HTS_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters: {
                    sessionId,
                    departements:
                        simulateDto.departements ||
                        departmentList.filter(
                            (departement) => !RegionsHorsMetropole.includes(department2region[departement]),
                        ),
                    niveauScolaires: simulateDto.niveauScolaires || Object.values(GRADES),
                    changementDepartements: simulateDto.changementDepartements || [],
                },
            },
        });
        return task;
    }

    @UseGuards(AdminGuard)
    @Get("/:sessionId/simulations")
    async getSimulations(@Param("sessionId") sessionId: string): Promise<any> {
        const simulations = await this.taskGateway.findByName(TaskName.AFFECTATION_HTS_SIMULATION, {
            "metadata.parameters.sessionId": sessionId,
        });
        return simulations;
    }
}
