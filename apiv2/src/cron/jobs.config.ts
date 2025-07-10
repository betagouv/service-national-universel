import { JobsOptions } from "bullmq";

export interface CronJob {
    name: CronJobName;
    pattern: string;
    data?: Record<string, unknown>;
    opts?: JobsOptions;
    tz?: string;
}

export enum CronJobName {
    ENVOYER_CAMPAGNES_PROGRAMMEES = "envoyer-campagnes-programmees",
    EXPORT_MISSIONS_CLEANUP = "export-missions-cleanup",
    EXPORT_JEUNE_CLEANUP = "export-jeune-cleanup",
}

export const cronJobs: CronJob[] = [
    {
        name: CronJobName.ENVOYER_CAMPAGNES_PROGRAMMEES,
        pattern: "0 8-18 * * *",
        tz: "Europe/Paris",
    },
    {
        name: CronJobName.EXPORT_MISSIONS_CLEANUP,
        pattern: "0 4 * * *",
        tz: "Europe/Paris",
    },
    {
        name: CronJobName.EXPORT_JEUNE_CLEANUP,
        pattern: "0 4 * * *",
        tz: "Europe/Paris",
    },
];
