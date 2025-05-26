import { JobsOptions } from "bullmq";

export interface CronJob {
    name: CronJobName;
    pattern: string;
    data?: Record<string, unknown>;
    opts?: JobsOptions;
}

export enum CronJobName {
    ENVOYER_CAMPAGNES_PROGRAMMEES = "envoyer-campagnes-programmees",
}

export const cronJobs: CronJob[] = [
    {
        name: CronJobName.ENVOYER_CAMPAGNES_PROGRAMMEES,
        pattern: "0 8-18 * * *",
    },
];
