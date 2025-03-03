import { Injectable } from "@nestjs/common";
import { TaskQueue } from "@shared/infra/Queue";
import {
    SimulationAffectationCLETaskResult,
    SimulationAffectationHTSTaskResult,
    TaskName,
    ValiderAffectationCLETaskResult,
    ValiderAffectationHTSTaskResult,
    ValiderAffectationCLEDromComTaskResult,
    SimulationAffectationHTSDromComTaskResult,
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
import { DesisterPostAffectationTaskModel } from "@admin/core/sejours/phase1/desistement/DesisterPostAffectationTask.model";
import { DesisterPostAffectation } from "@admin/core/sejours/phase1/desistement/DesisterPostAffectation";
import { SimulationAffectationHTSDromCom } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSDromCom";
import { ValiderAffectationHTSDromCom } from "@admin/core/sejours/phase1/affectation/ValiderAffectationHTSDromCom";
import { ValiderAffectationHTSDromComTaskModel } from "@admin/core/sejours/phase1/affectation/ValiderAffectationHTSDromComTask.model";

@Injectable()
export class AdminTaskAffectationSelectorService {
    constructor(
        private readonly simulationAffectationHts: SimulationAffectationHTS,
        private readonly validerAffectationHts: ValiderAffectationHTS,
        private readonly simulationAffectationHtsDromCom: SimulationAffectationHTSDromCom,
        private readonly validerAffectationHtsDromCom: ValiderAffectationHTSDromCom,
        private readonly simulationAffectationCle: SimulationAffectationCLE,
        private readonly validerAffectationCle: ValiderAffectationCLE,
        private readonly simulationAffectationCLEDromCom: SimulationAffectationCLEDromCom,
        private readonly validerAffectationCLEDromCom: ValiderAffectationCLEDromCom,
        private readonly desisterPostAffectation: DesisterPostAffectation,
        private readonly adminTaskRepository: AdminTaskRepository,
    ) {}
    async handleAffectation(job: Job<TaskQueue, any, TaskName>, task: TaskModel): Promise<Record<string, any>> {
        let results = {} as Record<string, any>;
        switch (job.name) {
            //  HTS METROPOLE
            case TaskName.AFFECTATION_HTS_SIMULATION:
                const simulationHtsTask: SimulationAffectationHTSTaskModel = task; // pour l'onglet historique (patches)
                const simulationhts = await this.simulationAffectationHts.execute(
                    simulationHtsTask.metadata!.parameters!,
                );
                results = {
                    rapportKey: simulationhts.rapportFile.Key,
                    selectedCost: simulationhts.analytics.selectedCost,
                    iterationCostList: simulationhts.analytics.iterationCostList,
                    jeunesNouvellementAffected: simulationhts.analytics.jeunesNouvellementAffected,
                    jeuneAttenteAffectation: simulationhts.analytics.jeuneAttenteAffectation,
                    jeunesDejaAffected: simulationhts.analytics.jeunesDejaAffected,
                } as SimulationAffectationHTSTaskResult;
                break;

            case TaskName.AFFECTATION_HTS_SIMULATION_VALIDER:
                const validationHtsTask: ValiderAffectationHTSTaskModel = task;
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

            //  HTS METROPOLE
            case TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION:
                const simulationHtsDromComTask: SimulationAffectationHTSTaskModel = task; // pour l'onglet historique (patches)
                const simulationhtsDromcom = await this.simulationAffectationHtsDromCom.execute(
                    simulationHtsDromComTask.metadata!.parameters!,
                );
                results = {
                    rapportKey: simulationhtsDromcom.rapportFile.Key,
                    jeunesNouvellementAffected: simulationhtsDromcom.analytics.jeunesNouvellementAffected,
                    jeuneAttenteAffectation: simulationhtsDromcom.analytics.jeuneAttenteAffectation,
                    jeunesDejaAffected: simulationhtsDromcom.analytics.jeunesDejaAffected,
                } as SimulationAffectationHTSDromComTaskResult;
                break;

            case TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION_VALIDER:
                const validationHtsDromComTask: ValiderAffectationHTSDromComTaskModel = task;
                const validationDromComResult = await this.validerAffectationHtsDromCom.execute({
                    ...validationHtsDromComTask.metadata!.parameters!,
                    dateAffectation: validationHtsDromComTask.createdAt,
                });
                results = {
                    rapportKey: validationDromComResult.rapportFile.Key,
                    jeunesAffected: validationDromComResult.analytics.jeunesAffected,
                    errors: validationDromComResult.analytics.errors,
                } as ValiderAffectationHTSTaskResult;
                // TODO: handle errors with partial results for all tasks
                if (validationDromComResult.analytics.jeunesAffected === 0) {
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
                const simulationCleTask: SimulationAffectationCLETaskModel = task; // pour l'onglet historique (patches)
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
                const validationCleTask: ValiderAffectationCLETaskModel = task;
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
                const simulationCleDromComTask: SimulationAffectationCLEDromComTaskModel = task;
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
                const validationCleDromComTask: ValiderAffectationCLETaskModel = task;
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

            case TaskName.DESISTEMENT_POST_AFFECTATION:
                const desistementPostAffectationTask: DesisterPostAffectationTaskModel = task;
                const affectationTask = await this.adminTaskRepository.findById(
                    desistementPostAffectationTask.metadata!.parameters!.affectationTaskId,
                );
                if (!affectationTask) {
                    throw new Error("Affectation task not found");
                }
                const desistementPostAffectationResult = await this.desisterPostAffectation.execute({
                    sessionId: desistementPostAffectationTask.metadata!.parameters!.sessionId,
                    rapportKey: affectationTask.metadata?.results.rapportKey,
                });
                results = desistementPostAffectationResult;
                break;

            default:
                throw new Error(`Task of type ${job.name} not handle yet for affectation`);
        }
        return results;
    }
}
