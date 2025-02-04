import { Injectable } from "@nestjs/common";
import { TaskQueue } from "@shared/infra/Queue";
import {
    SimulationAffectationCLETaskResult,
    SimulationAffectationHTSTaskResult,
    TaskName,
    ValiderAffectationCLETaskResult,
    ValiderAffectationHTSTaskResult,
    ValiderAffectationCLEDromComTaskResult,
} from "snu-lib";
import { Job } from "bullmq";
import { SimulationAffectationHTSTaskModel } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSTask.model";
import { ValiderAffectationHTSTaskModel } from "@admin/core/sejours/phase1/affectation/ValiderAffectationHTSTask.model";
import { SimulationAffectationCLETaskModel } from "@admin/core/sejours/phase1/affectation/SimulationAffectationCLETask.model";
import { ValiderAffectationCLETaskModel } from "@admin/core/sejours/phase1/affectation/ValiderAffectationCLETask.model";
import { TaskModel } from "@task/core/Task.model";
import { ValiderAffectationHTS } from "@admin/core/sejours/phase1/affectation/ValiderAffectationHTS";
import { SimulationAffectationHTS } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import { AdminTaskRepository } from "./AdminTaskMongo.repository";
import { SimulationAffectationCLE } from "@admin/core/sejours/phase1/affectation/SimulationAffectationCLE";
import { ValiderAffectationCLE } from "@admin/core/sejours/phase1/affectation/ValiderAffectationCLE";
import { SimulationAffectationCLEDromComTaskModel } from "@admin/core/sejours/phase1/affectation/SimulationAffectationCLEDromComTask.model";
import { SimulationAffectationCLEDromCom } from "@admin/core/sejours/phase1/affectation/SimulationAffectationCLEDromCom";
import { ValiderAffectationCLEDromCom } from "@admin/core/sejours/phase1/affectation/ValiderAffectationCLEDromCom";

@Injectable()
export class AdminTaskAffectationSelectorService {
    constructor(
        private readonly simulationAffectationHts: SimulationAffectationHTS,
        private readonly validerAffectationHts: ValiderAffectationHTS,
        private readonly adminTaskRepository: AdminTaskRepository,
        private readonly simulationAffectationCle: SimulationAffectationCLE,
        private readonly validerAffectationCle: ValiderAffectationCLE,
        private readonly simulationAffectationCLEDromCom: SimulationAffectationCLEDromCom,
        private readonly validerAffectationCLEDromCom: ValiderAffectationCLEDromCom,
    ) {}
    async handleAffectation(job: Job<TaskQueue, any, TaskName>, task: TaskModel): Promise<Record<string, any>> {
        let results = {} as Record<string, any>;
        switch (job.name) {
            //  HTS METROPOLE
            case TaskName.AFFECTATION_HTS_SIMULATION:
                const simulationHtsTask = task as SimulationAffectationHTSTaskModel; // pour l'onglet historique (patches)
                const simulationhts = await this.simulationAffectationHts.execute(
                    simulationHtsTask.metadata!.parameters!,
                );
                results = {
                    rapportKey: simulationhts.rapportFile.Key,
                    selectedCost: simulationhts.analytics.selectedCost,
                    jeunesNouvellementAffected: simulationhts.analytics.jeunesNouvellementAffected,
                    jeuneAttenteAffectation: simulationhts.analytics.jeuneAttenteAffectation,
                    jeunesDejaAffected: simulationhts.analytics.jeunesDejaAffected,
                } as SimulationAffectationHTSTaskResult;
                break;

            case TaskName.AFFECTATION_HTS_SIMULATION_VALIDER:
                const validationHtsTask = task as ValiderAffectationHTSTaskModel;
                const validationResult = await this.validerAffectationHts.execute({
                    ...validationHtsTask.metadata!.parameters!,
                    dateAffectation: validationHtsTask.createdAt,
                });
                results = {
                    rapportKey: validationResult.rapportFile.Key,
                    jeunesAffected: validationResult.analytics.jeunesAffected,
                    errors: validationResult.analytics.errors,
                } as ValiderAffectationHTSTaskResult;
                // TODO: handle errors with partial results for all tasks
                if (validationResult.analytics.jeunesAffected === 0) {
                    await this.adminTaskRepository.update(task.id, {
                        ...task,
                        metadata: {
                            ...task.metadata,
                            results,
                        },
                    });
                    throw new Error("Aucun jeune n'a été affecté");
                }
                break;

            //  CLE METROPOLE
            case TaskName.AFFECTATION_CLE_SIMULATION:
                const simulationCleTask = task as SimulationAffectationCLETaskModel; // pour l'onglet historique (patches)
                const simulationCle = await this.simulationAffectationCle.execute(
                    simulationCleTask.metadata!.parameters!,
                );
                results = {
                    rapportKey: simulationCle.rapportFile.Key,
                    jeunesAffected: simulationCle.analytics.jeunesAffected,
                    erreurs: simulationCle.analytics.erreurs,
                    classes: simulationCle.analytics.classes,
                } as SimulationAffectationCLETaskResult;
                break;

            case TaskName.AFFECTATION_CLE_SIMULATION_VALIDER:
                const validationCleTask = task as ValiderAffectationCLETaskModel;
                const validationCleResult = await this.validerAffectationCle.execute({
                    ...validationCleTask.metadata!.parameters!,
                    dateAffectation: validationCleTask.createdAt,
                });
                results = {
                    rapportKey: validationCleResult.rapportFile.Key,
                    jeunesAffected: validationCleResult.analytics.jeunesAffected,
                    errors: validationCleResult.analytics.errors,
                } as ValiderAffectationCLETaskResult;
                // TODO: handle errors with partial results for all tasks
                if (validationCleResult.analytics.jeunesAffected === 0) {
                    await this.adminTaskRepository.update(task.id, {
                        ...task,
                        metadata: {
                            ...task.metadata,
                            results,
                        },
                    });
                    throw new Error("Aucun jeune n'a été affecté");
                }
                break;

            //  CLE DROM COM et Corse
            case TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION:
                const simulationCleDromComTask = task as SimulationAffectationCLEDromComTaskModel;
                const simulationCleDromComResult = await this.simulationAffectationCLEDromCom.execute(
                    simulationCleDromComTask.metadata!.parameters!,
                );
                results = {
                    rapportKey: simulationCleDromComResult.rapportFile.Key,
                    jeunesAffected: simulationCleDromComResult.analytics.jeunesAffected,
                    erreurs: simulationCleDromComResult.analytics.erreurs,
                    classes: simulationCleDromComResult.analytics.classes,
                } as SimulationAffectationCLETaskResult;
                break;

            case TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER:
                const validationCleDromComTask = task as ValiderAffectationCLETaskModel;
                const validationCleDromComResult = await this.validerAffectationCLEDromCom.execute({
                    ...validationCleDromComTask.metadata!.parameters!,
                    dateAffectation: validationCleDromComTask.createdAt,
                });
                results = {
                    rapportKey: validationCleDromComResult.rapportFile.Key,
                    jeunesAffected: validationCleDromComResult.analytics.jeunesAffected,
                    errors: validationCleDromComResult.analytics.errors,
                } as ValiderAffectationCLEDromComTaskResult;
                // TODO: handle errors with partial results for all tasks
                if (validationCleDromComResult.analytics.jeunesAffected === 0) {
                    await this.adminTaskRepository.update(task.id, {
                        ...task,
                        metadata: {
                            ...task.metadata,
                            results,
                        },
                    });
                    throw new Error("Aucun jeune n'a été affecté");
                }
                break;

            default:
                throw new Error(`Task of type ${job.name} not handle yet for affectation`);
        }
        return results;
    }
}
