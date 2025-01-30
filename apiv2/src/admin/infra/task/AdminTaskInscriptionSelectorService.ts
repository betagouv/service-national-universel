import { Job } from "bullmq";
import { TaskName, ValiderBasculeJeunesValidesTaskResult } from "snu-lib";

import { Injectable } from "@nestjs/common";
import { TaskQueue } from "@shared/infra/Queue";
import { TaskModel } from "@task/core/Task.model";
import {
    SimulationBasculeJeunesValidesTaskModel,
    SimulationBasculeJeunesValidesTaskResult,
} from "@admin/core/sejours/phase1/inscription/SimulationBasculeJeunesValidesTask.model";
import { ValiderBasculeJeunesValidesTaskModel } from "@admin/core/sejours/phase1/inscription/ValiderBasculeJeunesValides.model";
import { SimulationBasculeJeunesValides } from "@admin/core/sejours/phase1/inscription/SimulationBasculeJeunesValides";
import { ValiderBasculeJeunesValides } from "@admin/core/sejours/phase1/inscription/ValiderBasculeJeunesValides";

@Injectable()
export class AdminTaskInscriptionSelectorService {
    constructor(
        private readonly simulationBasculeJeunesValides: SimulationBasculeJeunesValides,
        private readonly validerBasculeJeunesValides: ValiderBasculeJeunesValides,
    ) {}
    async handleInscription(job: Job<TaskQueue, any, TaskName>, task: TaskModel): Promise<Record<string, any>> {
        let results = {} as Record<string, any>;
        switch (job.name) {
            case TaskName.BACULE_JEUNES_VALIDES_SIMULATION:
                const simulationBasculeTask = task as SimulationBasculeJeunesValidesTaskModel;
                const simulation = await this.simulationBasculeJeunesValides.execute(
                    simulationBasculeTask.metadata!.parameters!,
                );
                results = {
                    rapportKey: simulation.rapportFile.Key,
                    ...simulation.analytics,
                } as SimulationBasculeJeunesValidesTaskResult;
                break;
            case TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER:
                const validationBasculeTask = task as ValiderBasculeJeunesValidesTaskModel;
                const validationBasculeSimulation = await this.validerBasculeJeunesValides.execute({
                    ...validationBasculeTask.metadata!.parameters!,
                    dateValidation: validationBasculeTask.createdAt,
                });
                results = {
                    rapportKey: validationBasculeSimulation.rapportFile.Key,
                    ...validationBasculeSimulation.analytics,
                } as ValiderBasculeJeunesValidesTaskResult;
                break;
            default:
                throw new Error(`Task of type ${job.name} not handle yet for inscription`);
        }
        return results;
    }
}
