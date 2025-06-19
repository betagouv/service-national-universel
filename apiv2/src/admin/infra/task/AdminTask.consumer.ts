import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { ClsService } from "nestjs-cls";

import { TaskName } from "snu-lib";

import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { QueueName, TaskQueue } from "@shared/infra/Queue";
import { AdminTaskRepository } from "./AdminTaskMongo.repository";
import { ReferentielImportTaskModel } from "@admin/core/referentiel/routes/ReferentielImportTask.model";
import { AdminTaskImportReferentielSelectorService } from "./AdminTaskImportReferentielSelector.service";
import { AdminTaskAffectationSelectorService } from "./AdminTaskAffectationSelector.service";
import { AdminTaskInscriptionSelectorService } from "./AdminTaskInscriptionSelector.service";
import { ImportClasseEnMasseTaskModel } from "@admin/core/sejours/cle/classe/importEnMasse/ClasseImportEnMasse.model";
import { ImporterClasseEnMasse } from "@admin/core/sejours/cle/classe/importEnMasse/useCase/ImporterClasseEnMasse";
import { AdminTaskEngagementSelectorService } from "./AdminTaskEngagementSelector";

@Processor(QueueName.ADMIN_TASK)
export class AdminTaskConsumer extends WorkerHost {
    constructor(
        private readonly logger: Logger,
        private readonly adminTaskRepository: AdminTaskRepository,
        private readonly adminTaskAffectationSelectorService: AdminTaskAffectationSelectorService,
        private readonly adminTaskInscriptionSelectorService: AdminTaskInscriptionSelectorService,
        private readonly adminTaskEngagementSelectorService: AdminTaskEngagementSelectorService,
        private readonly referentielTaskService: AdminTaskImportReferentielSelectorService,
        private readonly importerClasseEnMasse: ImporterClasseEnMasse,
        private readonly cls: ClsService,
    ) {
        super();
    }
    async process(job: Job<TaskQueue, any, TaskName>): Promise<ConsumerResponse> {
        // TODO : benchmark sur les perf de la création d'un contexte cls
        return this.cls.run(async () => {
            this.logger.log(
                `Processing task "${job.name}" with data ${JSON.stringify(job.data)}`,
                AdminTaskConsumer.name,
            );

            let results: Record<string, any> = {};
            try {
                const task = await this.adminTaskRepository.toInProgress(job.data.id);
                this.cls.set("user", { id: "", firstName: job.name, lastName: task.metadata?.parameters?.type });
                switch (job.name) {
                    case TaskName.AFFECTATION_HTS_SIMULATION:
                    case TaskName.AFFECTATION_HTS_SIMULATION_VALIDER:
                    case TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION:
                    case TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION_VALIDER:
                    case TaskName.AFFECTATION_CLE_SIMULATION:
                    case TaskName.AFFECTATION_CLE_SIMULATION_VALIDER:
                    case TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION:
                    case TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER:
                    case TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION:
                    case TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER:
                        results = await this.adminTaskAffectationSelectorService.handleAffectation(job, task);
                        break;
                    case TaskName.BACULE_JEUNES_VALIDES_SIMULATION:
                    case TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER:
                    case TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION:
                    case TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER:
                        results = await this.adminTaskInscriptionSelectorService.handleInscription(job, task);
                        break;
                    case TaskName.REFERENTIEL_IMPORT:
                        const importTask: ReferentielImportTaskModel = task;
                        this.logger.log(
                            `Processing import task "${importTask.metadata?.parameters?.type}"`,
                            AdminTaskConsumer.name,
                        );
                        results = await this.referentielTaskService.handleImporterReferentiel(importTask);
                        break;
                    case TaskName.IMPORT_CLASSE_EN_MASSE:
                        this.cls.set("user", {
                            id: task.metadata?.parameters?.auteur.id,
                            firstName: task.metadata?.parameters?.auteur.prenom,
                            lastName: task.metadata?.parameters?.auteur.nom,
                            email: task.metadata?.parameters?.auteur.email,
                            role: task.metadata?.parameters?.auteur.role,
                            sousRole: task.metadata?.parameters?.auteur.sousRole,
                        });
                        const importTaskClassesEnMasse: ImportClasseEnMasseTaskModel = task;
                        this.logger.log(`Processing task "${TaskName.IMPORT_CLASSE_EN_MASSE}"`, AdminTaskConsumer.name);
                        await this.importerClasseEnMasse.execute(importTaskClassesEnMasse.metadata?.parameters);
                        break;
                    case TaskName.MISSION_EXPORT_CANDIDATURES:
                    case TaskName.MISSION_EXPORT:
                        results = await this.adminTaskEngagementSelectorService.handleEngagement(job, task);
                        break;
                    default:
                        throw new Error(`Task "${job.name}" not handle yet`);
                }
            } catch (error: any) {
                this.logger.error(
                    `Error processing task "${job.name}" - ${error.message} - ${error.options?.description} - ${error.stack}`,
                    AdminTaskConsumer.name,
                );
                await this.adminTaskRepository.toFailed(job.data.id, error.message, error.options?.description);
                return ConsumerResponse.FAILURE;
            }
            this.logger.log(
                `Task "${job.name}" processed successfully with data ${JSON.stringify(job.data)}`,
                AdminTaskConsumer.name,
            );
            await this.adminTaskRepository.toSuccess(job.data.id, results);
            return ConsumerResponse.SUCCESS;
        });
    }
}
