import { Injectable } from "@nestjs/common";
import { EnvoyerCampagneProgrammee } from "@plan-marketing/core/useCase/cron/EnvoyerCampagneProgrammee";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";
import { Job } from "bullmq";
import { CronJob, CronJobName } from "../jobs.config";

@Injectable()
export class CronJobSelectorService {
    constructor(private readonly envoyerCampagneProgrammee: EnvoyerCampagneProgrammee) {}

    async handleCronJob(job: Job<CronJob, any, CronJobName>): Promise<void> {
        switch (job.name) {
            case CronJobName.ENVOYER_CAMPAGNES_PROGRAMMEES:
                await this.envoyerCampagneProgrammee.execute();
                break;

            default:
                throw new TechnicalException(
                    TechnicalExceptionType.CRON_JOB_NOT_HANDLED,
                    `Cron job of type ${job.name} not handled yet`,
                );
        }
    }
}
