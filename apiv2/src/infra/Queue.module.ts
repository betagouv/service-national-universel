import { ConfigModule, ConfigService } from "@nestjs/config";

import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { QueueName } from "@shared/infra/Queue";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import * as basicAuth from "express-basic-auth";
import { MaskedBullMQAdapter, bullBoardIpAllowlist } from "./security/BullBoardSecurity";
import { RATE_LIMITS, rateLimitStoreFactory, rateLimiter } from "./security/RateLimit";

/** Un email envoyé n'a plus à rester dans Redis : ses données (liens d'invitation compris) partent avec. */
const EMAIL_JOB_OPTIONS = {
    removeOnComplete: true,
    removeOnFail: { age: 7 * 24 * 60 * 60 }, // 7 jours pour diagnostiquer un échec
};

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: {
                    url: config.getOrThrow("broker.url"),
                },
                prefix: config.getOrThrow("broker.queuePrefix"),
                lockDuration: 1000 * 60 * 20, // 20 minutes
            }),
        }),
        BullModule.registerQueue({
            name: QueueName.EMAIL,
            defaultJobOptions: EMAIL_JOB_OPTIONS,
        }),
        BullModule.registerQueue({
            name: QueueName.CONTACT,
        }),
        BullModule.registerQueue({
            name: QueueName.ADMIN_TASK,
        }),
        BullModule.registerQueue({
            name: QueueName.CRON,
        }),
        BullBoardModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const environment = config.get<string>("environment") ?? "development";
                const store = rateLimitStoreFactory(environment, config.getOrThrow("broker.url"));
                return {
                    route: "/queues",
                    adapter: ExpressAdapter,
                    middleware: [
                        bullBoardIpAllowlist(
                            config.get<string>("broker.monitorAllowedIps") ?? "",
                            !config.get<boolean>("httpServer.enforceHost"),
                        ),
                        // Seuls les échecs d'authentification consomment du quota.
                        rateLimiter({
                            store: store("bull-board"),
                            ...RATE_LIMITS.bullBoard,
                            skipSuccessfulRequests: true,
                        }),
                        basicAuth({
                            challenge: true,
                            users: {
                                [config.getOrThrow("broker.monitorUser")]: config.getOrThrow("broker.monitorSecret"),
                            },
                        }),
                    ],
                };
            },
        }),
        BullBoardModule.forFeature({
            name: QueueName.EMAIL,
            adapter: MaskedBullMQAdapter,
        }),
        BullBoardModule.forFeature({
            name: QueueName.CONTACT,
            adapter: MaskedBullMQAdapter,
        }),
        BullBoardModule.forFeature({
            name: QueueName.ADMIN_TASK,
            adapter: MaskedBullMQAdapter,
        }),
        BullBoardModule.forFeature({
            name: QueueName.CRON,
            adapter: MaskedBullMQAdapter,
        }),
    ],
    exports: [BullModule],
})
export class QueueModule {}
