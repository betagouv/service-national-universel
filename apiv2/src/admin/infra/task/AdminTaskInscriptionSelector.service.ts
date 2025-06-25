import { Job } from "bullmq";
import {
    SimulationBasculeJeunesValidesTaskResult,
    TaskName,
    ValiderBasculeJeunesNonValidesTaskResult,
    ValiderBasculeJeunesValidesTaskResult,
} from "snu-lib";

import { Injectable } from "@nestjs/common";
import { TaskQueue } from "@shared/infra/Queue";
import { TaskModel } from "@task/core/Task.model";

import { ValiderBasculeJeunesValidesTaskModel } from "@admin/core/sejours/phase1/inscription/ValiderBasculeJeunesValides.model";

import { ValiderBasculeJeunesValides } from "@admin/core/sejours/phase1/inscription/ValiderBasculeJeunesValides";
import { SimulationBasculeJeunes } from "@admin/core/sejours/phase1/inscription/SimulationBasculeJeunes";
import { SimulationBasculeJeunesTaskModel } from "@admin/core/sejours/phase1/inscription/SimulationBasculeJeunesTask.model";
import { ValiderBasculeJeunesNonValidesTaskModel } from "@admin/core/sejours/phase1/inscription/ValiderBasculeJeunesNonValides.model";
import { ValiderBasculeJeunesNonValides } from "@admin/core/sejours/phase1/inscription/ValiderBasculeJeunesNonValides";
import { ExporterJeunes } from "@admin/core/sejours/phase1/jeune/ExporterJeunes";

@Injectable()
export class AdminTaskInscriptionSelectorService {
    constructor(
        private readonly simulationBasculeJeunes: SimulationBasculeJeunes,
        private readonly validerBasculeJeunesValides: ValiderBasculeJeunesValides,
        private readonly validerBasculeJeunesNonValides: ValiderBasculeJeunesNonValides,
        private readonly exportJeunes: ExporterJeunes,
    ) {}
    async handleInscription(job: Job<TaskQueue, any, TaskName>, task: TaskModel): Promise<Record<string, any>> {
        let results = {} as Record<string, any>;
        switch (job.name) {
            case TaskName.BACULE_JEUNES_VALIDES_SIMULATION:
                const simulationBasculeTask: SimulationBasculeJeunesTaskModel = task;
                const simulation = await this.simulationBasculeJeunes.execute(
                    simulationBasculeTask.metadata!.parameters!,
                    "bascule-jeunes-valides",
                );
                results = {
                    rapportKey: simulation.rapportFile.Key,
                    ...simulation.analytics,
                } as SimulationBasculeJeunesValidesTaskResult;
                break;
            case TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER:
                const validationBasculeTask: ValiderBasculeJeunesValidesTaskModel = task;
                const validationBasculeSimulation = await this.validerBasculeJeunesValides.execute({
                    ...validationBasculeTask.metadata!.parameters!,
                    dateValidation: validationBasculeTask.createdAt,
                });
                results = {
                    rapportKey: validationBasculeSimulation.rapportFile.Key,
                    ...validationBasculeSimulation.analytics,
                } as ValiderBasculeJeunesValidesTaskResult;
                break;
            case TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION:
                const simulationBasculeNonValidesTask = task as SimulationBasculeJeunesTaskModel;
                const simulationNonValides = await this.simulationBasculeJeunes.execute(
                    simulationBasculeNonValidesTask.metadata!.parameters!,
                    "bascule-jeunes-non-valides",
                );
                results = {
                    rapportKey: simulationNonValides.rapportFile.Key,
                    ...simulationNonValides.analytics,
                } as SimulationBasculeJeunesValidesTaskResult;
                break;
            case TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER:
                const validationBasculeNonValidesTask = task as ValiderBasculeJeunesNonValidesTaskModel;
                const validationBasculeNonValidesSimulation = await this.validerBasculeJeunesNonValides.execute({
                    ...validationBasculeNonValidesTask.metadata!.parameters!,
                    dateValidation: validationBasculeNonValidesTask.createdAt,
                });
                results = {
                    rapportKey: validationBasculeNonValidesSimulation.rapportFile.Key,
                    ...validationBasculeNonValidesSimulation.analytics,
                } as ValiderBasculeJeunesNonValidesTaskResult;
                break;
            case TaskName.JEUNE_EXPORT:
                const exportInscription = await this.exportJeunes.execute(task.metadata!.parameters!);
                results = {
                    rapportKey: exportInscription.rapportFile.Key,
                    ...exportInscription.analytics,
                };
                break;
            default:
                throw new Error(`Task of type ${job.name} not handle yet for inscription`);
        }
        return results;
    }
}
