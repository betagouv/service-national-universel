import { getQueueToken } from "@nestjs/bullmq";
import { Test, TestingModule } from "@nestjs/testing";
import { QueueName } from "@shared/infra/Queue";
import { CronJobSchedulerService } from "./CronJobScheduler.service";

jest.mock("../jobs.config", () => {
    const originalModule = jest.requireActual("../jobs.config");
    return {
        __esModule: true,
        ...originalModule,
        CronJobName: {
            ...originalModule.CronJobName,
            ENVOYER_CAMPAGNES_PROGRAMMEES: "envoyer-campagnes-programmees",
            NETTOYER_FICHIERS: "nettoyer-fichiers",
        },
        cronJobs: [
            {
                name: "envoyer-campagnes-programmees",
                pattern: "0 * * * *",
            },
            {
                name: "nettoyer-fichiers",
                pattern: "0 0 * * *",
            },
        ],
    };
});

describe("CronJobSchedulerService", () => {
    let service: CronJobSchedulerService;
    let jobQueue: {
        getJobSchedulers: jest.Mock;
        removeJobScheduler: jest.Mock;
        upsertJobScheduler: jest.Mock;
    };

    beforeEach(async () => {
        jobQueue = {
            getJobSchedulers: jest.fn(),
            removeJobScheduler: jest.fn(),
            upsertJobScheduler: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CronJobSchedulerService,
                {
                    provide: getQueueToken(QueueName.CRON),
                    useValue: jobQueue,
                },
            ],
        }).compile();

        service = module.get<CronJobSchedulerService>(CronJobSchedulerService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("scheduleJobs", () => {
        it("should remove jobs that are no longer in configuration", async () => {
            const oldJob = { name: "old-job-name" };
            jobQueue.getJobSchedulers.mockResolvedValue([oldJob]);

            await service["scheduleJobs"]();

            expect(jobQueue.getJobSchedulers).toHaveBeenCalled();
            expect(jobQueue.removeJobScheduler).toHaveBeenCalledWith(oldJob.name);
        });

        it("should add/update all jobs from configuration", async () => {
            jobQueue.getJobSchedulers.mockResolvedValue([]);

            await service["scheduleJobs"]();

            expect(jobQueue.getJobSchedulers).toHaveBeenCalled();

            const mockedCronJobs = jest.requireMock("../jobs.config").cronJobs;
            mockedCronJobs.forEach((job) => {
                expect(jobQueue.upsertJobScheduler).toHaveBeenCalledWith(
                    job.name,
                    { pattern: job.pattern },
                    {
                        name: job.name,
                        data: job.data,
                        opts: {
                            ...job.opts,
                        },
                    },
                );
            });
        });

        it("should not remove jobs that are still in configuration", async () => {
            const existingJob = { name: "nettoyer-fichiers" };
            jobQueue.getJobSchedulers.mockResolvedValue([existingJob]);

            await service["scheduleJobs"]();

            expect(jobQueue.getJobSchedulers).toHaveBeenCalled();
            expect(jobQueue.removeJobScheduler).not.toHaveBeenCalledWith(existingJob.name);
            const mockedCronJobs = jest.requireMock("../jobs.config").cronJobs;
            expect(jobQueue.upsertJobScheduler).toHaveBeenCalledTimes(mockedCronJobs.length);
        });

        it("should handle mixed case of existing and non-existing jobs", async () => {
            const existingJob = { name: "nettoyer-fichiers" };
            const oldJob = { name: "old-job-to-remove" };
            jobQueue.getJobSchedulers.mockResolvedValue([existingJob, oldJob]);

            await service["scheduleJobs"]();

            expect(jobQueue.getJobSchedulers).toHaveBeenCalled();
            expect(jobQueue.removeJobScheduler).toHaveBeenCalledWith(oldJob.name);
            expect(jobQueue.removeJobScheduler).not.toHaveBeenCalledWith(existingJob.name);
            const mockedCronJobs = jest.requireMock("../jobs.config").cronJobs;
            expect(jobQueue.upsertJobScheduler).toHaveBeenCalledTimes(mockedCronJobs.length);
        });
    });
});
