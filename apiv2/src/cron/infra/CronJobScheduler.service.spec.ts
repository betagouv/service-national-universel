import { Test, TestingModule } from "@nestjs/testing";
import { CronJobSchedulerService } from "./CronJobScheduler.service";
import { Logger } from "@nestjs/common";
import { getQueueToken } from "@nestjs/bullmq";
import { QueueName } from "@shared/infra/Queue";
import { cronJobs, CronJobName } from "../jobs.config";

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

            cronJobs.forEach((job) => {
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
            const existingJob = { name: CronJobName.ENVOYER_CAMPAGNES_PROGRAMMEES };
            jobQueue.getJobSchedulers.mockResolvedValue([existingJob]);

            await service["scheduleJobs"]();

            expect(jobQueue.getJobSchedulers).toHaveBeenCalled();
            expect(jobQueue.removeJobScheduler).not.toHaveBeenCalledWith(existingJob.name);
            expect(jobQueue.upsertJobScheduler).toHaveBeenCalledTimes(cronJobs.length);
        });

        it("should handle mixed case of existing and non-existing jobs", async () => {
            const existingJob = { name: CronJobName.ENVOYER_CAMPAGNES_PROGRAMMEES };
            const oldJob = { name: "old-job-to-remove" };
            jobQueue.getJobSchedulers.mockResolvedValue([existingJob, oldJob]);

            await service["scheduleJobs"]();

            expect(jobQueue.getJobSchedulers).toHaveBeenCalled();
            expect(jobQueue.removeJobScheduler).toHaveBeenCalledWith(oldJob.name);
            expect(jobQueue.removeJobScheduler).not.toHaveBeenCalledWith(existingJob.name);
            expect(jobQueue.upsertJobScheduler).toHaveBeenCalledTimes(cronJobs.length);
        });
    });
});
