import { ConfigModule, ConfigService } from "@nestjs/config";

import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { QueueName } from "@shared/infra/Queue";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import * as basicAuth from "express-basic-auth";

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
                lockDuration: 1000 * 60 * 10, // 10 minutes
            }),
        }),
        BullModule.registerQueue({
            name: QueueName.EMAIL,
        }),
        BullModule.registerQueue({
            name: QueueName.CONTACT,
        }),
        BullModule.registerQueue({
            name: QueueName.ADMIN_TASK,
        }),
        BullBoardModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                route: "/queues",
                adapter: ExpressAdapter,
                middleware: basicAuth({
                    challenge: true,
                    users: {
                        [config.getOrThrow("broker.monitorUser")]: config.getOrThrow("broker.monitorSecret"),
                    },
                }),
            }),
        }),
        BullBoardModule.forFeature({
            name: QueueName.EMAIL,
            adapter: BullMQAdapter,
        }),
        BullBoardModule.forFeature({
            name: QueueName.CONTACT,
            adapter: BullMQAdapter,
        }),
        BullBoardModule.forFeature({
            name: QueueName.ADMIN_TASK,
            adapter: BullMQAdapter,
        }),
    ],
    exports: [BullModule],
})
export class QueueModule {}
