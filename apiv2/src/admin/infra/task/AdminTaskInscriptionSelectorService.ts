import { Job } from "bullmq";
import { TaskName } from "snu-lib";

import { Injectable } from "@nestjs/common";
import { TaskQueue } from "@shared/infra/Queue";
import { TaskModel } from "@task/core/Task.model";
import {
    SimulationBasculeJeunesValidesTaskModel,
    SimulationBasculeJeunesValidesTaskResult,
} from "@admin/core/sejours/phase1/inscription/SimulationBasculeJeunesValidesTask.model";
import { SimulationBasculeJeunesValides } from "@admin/core/sejours/phase1/inscription/SimulationBasculeJeunesValides";

@Injectable()
export class AdminTaskInscriptionSelectorService {
    constructor(private readonly simulationBasculeJeunesValides: SimulationBasculeJeunesValides) {}
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
            default:
                throw new Error(`Task of type ${job.name} not handle yet for inscription`);
        }
        return results;
    }
}
