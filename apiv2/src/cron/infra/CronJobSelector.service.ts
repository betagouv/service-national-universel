import { Injectable } from "@nestjs/common";
import { EnvoyerCampagneProgrammee } from "@plan-marketing/core/useCase/cron/EnvoyerCampagneProgrammee";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";
import { Job } from "bullmq";
import { CronJob, CronJobName } from "../jobs.config";
import { NettoyageExportMissions } from "@admin/core/engagement/mission/cron/NettoyageExportMissions";
import { NettoyageExportJeune } from "@admin/core/sejours/phase1/jeune/cron/NettoyageExportJeune";

@Injectable()
export class CronJobSelectorService {
    constructor(
        private readonly envoyerCampagneProgrammee: EnvoyerCampagneProgrammee,
        private readonly nettoyageExportMissions: NettoyageExportMissions,
        private readonly nettoyageExportJeune: NettoyageExportJeune,
    ) {}

    async handleCronJob(job: Job<CronJob, any, CronJobName>): Promise<void> {
        switch (job.name) {
            case CronJobName.ENVOYER_CAMPAGNES_PROGRAMMEES:
                await this.envoyerCampagneProgrammee.execute();
                break;
            case CronJobName.EXPORT_MISSIONS_CLEANUP:
                await this.nettoyageExportMissions.execute();
                break;
            case CronJobName.EXPORT_JEUNE_CLEANUP:
                await this.nettoyageExportJeune.execute();
                break;
            default:
                throw new TechnicalException(
                    TechnicalExceptionType.CRON_JOB_NOT_HANDLED,
                    `Cron job of type ${job.name} not handled yet`,
                );
        }
    }
}
